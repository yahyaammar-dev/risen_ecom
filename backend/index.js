// starting server

// variables
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8888;
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const exceljs = require('exceljs');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const cors = require('cors');
const { ObjectId } = require('mongodb');




// Set up multer for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = './uploads/'; // Specify your upload path
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}${ext}`);
    },
});

const upload = multer({ storage, limits: { files: 10 } });


// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());



// importing models
const User = require('./models/User');
const Admin = require('./models/Admin');
const Branch = require('./models/Branch');
const Order = require('./models/Order');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Notification = require('./models/Notification')
const PromoCode = require('./models/PromoCode');


// connecting to db
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/ecom_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');


        // Routes

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });




        // Define your routes here
        app.get('/', async (req, res) => {
            try {
                const users = await User.find();
                res.json('hello world')
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });




        // Admin should be able to login by selecting a branch
        app.post('/adminlogin', async (req, res) => {
            const { email, password, branchName } = req.body;

            try {
                const admin = await Admin.findOne({ email, password });
                if (admin) {
                    if (admin.role === 'superadmin' || admin.branchName === branchName) {
                        res.json(admin);
                    } else {
                        res.status(403).json({ message: 'Access denied. Admin does not have access to the specified branch.' });
                    }
                } else {
                    res.status(404).json({ message: 'Admin not found with the provided credentials.' });
                }
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        })


        // admin should be able to see total sales, sales in last month, and sales in this week
        app.post('/calculateamount', async (req, res) => {
            const { branchId } = req.body;

            try {
                let matchStage = {};
                if (branchId) {
                    // If branchId is provided, filter by the specified branch
                    matchStage = { branch: new ObjectId(branchId) };
                }

                // Calculate the sum of all orders (either for a specific branch or all branches)
                const totalOrders = await Order.aggregate([
                    { $match: matchStage },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]);

                console.log('totalOrders', totalOrders)

                // Calculate the sum of last month's order payments
                const lastMonthOrders = await Order.aggregate([
                    {
                        $match: {
                            ...matchStage,
                            createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
                        },
                    },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]);

                // Calculate the sum of last week's order payments
                const lastWeekOrders = await Order.aggregate([
                    {
                        $match: {
                            ...matchStage,
                            createdAt: {
                                $gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000),
                                $lt: new Date(),
                            },
                        },
                    },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]);

                // Get the list of all products for the given branch(s)
                const products = await Product.find(matchStage);

                // Calculate the total amount for all products
                const totalAmountForAllProducts = products.reduce((total, product) => {
                    return total + product.price; // Assuming each product has a 'price' field
                }, 0);

                // Return the results
                res.json({
                    totalOrders: totalOrders.length > 0 ? totalOrders[0].total : 0,
                    lastMonthOrders: lastMonthOrders.length > 0 ? lastMonthOrders[0].total : 0,
                    lastWeekOrders: lastWeekOrders.length > 0 ? lastWeekOrders[0].total : 0,
                    totalAmountForAllProducts,
                });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });


        // admin should be able to see list of orders
        app.get('/orders/:branchId', async (req, res) => {
            const { branchId } = req.params;
            try {
                // Find the branch to ensure it exists
                const branch = await Branch.findById(branchId);

                if (!branch) {
                    return res.status(404).json({ message: 'Branch not found with the provided ID.' });
                }

                // Get all orders for the specified branch
                const orders = await Order.find({ branch: branchId })
                    .populate('user', 'name email')  // Assuming 'name' and 'email' are fields in the User model
                    .populate('products', 'name description');  // Assuming 'name' and 'description' are fields in the Product model

                res.json({ branchName: branch.name, orders });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });


        // admin should be able to see order detail
        app.post('/order-details', async (req, res) => {
            const { orderId } = req.body;
            try {
                // Find the order by ID and populate the 'user' field to get user details
                const order = await Order.findById(orderId).populate('user').populate('products');

                if (!order) {
                    return res.status(404).json({ message: 'Order not found with the provided ID.' });
                }

                // Return the order details with user information
                res.json(order);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });


        // admin should be able to create categories 
        app.post('/create-category', async (req, res) => {
            const { categoryName } = req.body;

            try {
                // Create a new category
                const category = new Category({
                    name: categoryName
                });

                // Save the category to the database
                await category.save();

                res.status(201).json({ message: 'Category created successfully', category });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });



        // admin should be able to create products
        app.post('/create-product', upload.array('images', 5), async (req, res) => {
            const { name, description, amount, category, barcodeId } = req.body;
            const imagePaths = req.files ? req.files.map(file => file.path) : [];

            try {
                // Validate that the specified category exists
                // const existingCategory = await Category.findOne({ name: category });
                // if (!existingCategory) {
                //     return res.status(400).json({ message: 'Category does not exist.' });
                // }

                // Create a new product
                const product = new Product({
                    name,
                    description,
                    amount,
                    category: category,
                    images: imagePaths,
                    barcodeId: barcodeId
                });

                // Save the product to the database
                await product.save();

                res.status(201).json({ message: 'Product created successfully', product });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });



        // admin should be able to upload product file 
        app.post('/upload-products', upload.single('file'), async (req, res) => {
            const { category } = req.body;
            const filePath = req.file ? req.file.path : null;

            try {
                // Validate that the specified category exists




                // Read the Excel file
                const workbook = xlsx.readFile(filePath);
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // Convert Excel data to JSON
                const jsonData = xlsx.utils.sheet_to_json(sheet);





                // Process each row in the Excel file
                console.log(jsonData)
                for (const data of jsonData) {
                    const barcode = data.barcode;
                    const existingProduct = await Product.findOne({ barcode });



                    // find branch name here 
                    // find category here
                    // find images url



                    if (existingProduct) {
                        // Update the existing product if it already exists
                        await Product.updateOne({ barcode }, { $set: { ...data, category: existingCategory._id } });
                    } else {
                        // Create a new product if it does not exist
                        const newProduct = new Product({ ...data });
                        await newProduct.save();
                    }
                }

                // Remove the uploaded file after processing
                fs.unlinkSync(filePath);

                res.status(200).json({ message: 'Products uploaded successfully' });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });



        // admin should be able to create notification  
        app.post('/create-notification', async (req, res) => {
            const { text, type } = req.body;

            try {
                // Create a new notification
                const notification = new Notification({
                    text,
                    type,
                });

                // Save the notification to the database
                await notification.save();

                res.status(201).json({ message: 'Notification created successfully', notification });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });




        // admin should be able to create promotions 
        app.post('/create-promotion', async (req, res) => {
            const { name, percentage, type, validTill } = req.body;

            try {
                // Create a new promotion
                const promotion = new PromoCode({
                    name,
                    percentage,
                    type,
                    validTill
                });

                // Save the promotion to the database
                await promotion.save();

                res.status(201).json({ message: 'Promotion created successfully', promotion });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });


        // Get all users
        app.get('/get-all-users', async (req, res) => {
            try {
                const users = await User.find();
                res.status(200).json({ users });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });


        // Get all products
        app.get('/get-all-products', async (req, res) => {
            try {
                const products = await Product.find();
                res.status(200).json({ products });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });


        /// Get all categories
        app.get('/get-all-categories', async (req, res) => {
            try {
                const categories = await Category.find();
                res.status(200).json({ categories });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });



        /// Get all promocodes
        app.get('/get-all-promos', async (req, res) => {
            try {
                const promoCodes = await PromoCode.find();
                res.status(200).json({ promoCodes });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });





        // admin should be able to apply promotion 
        app.post('/assign-promotion', isAdmin, async (req, res) => {
            const { type, typeId, promoCodeName } = req.body;

            try {
                // Find the promo code by ID
                const promoCode = await PromoCode.find({name: promoCodeName});

                if (!promoCode) {
                    return res.status(404).json({ message: 'PromoCode not found with the provided ID.' });
                }

                // Apply the promo code to the specified type (user, product, or category)
                switch (type) {
                    case 'user':
                        const user = await User.findById(typeId);
                        if (user) {
                            user.promoCode = promoCode._id;
                            await user.save();
                        } else {
                            return res.status(404).json({ message: 'User not found with the provided ID.' });
                        }
                        break;
                    case 'product':
                        const product = await Product.findById(typeId);
                        if (product) {
                            product.promoCode = promoCode._id;
                            await product.save();
                        } else {
                            return res.status(404).json({ message: 'Product not found with the provided ID.' });
                        }
                        break;
                    case 'category':
                        const category = await Category.findById(typeId);
                        if (category) {
                            category.promoCode = promoCode._id;
                            await category.save();
                        } else {
                            return res.status(404).json({ message: 'Category not found with the provided ID.' });
                        }
                        break;
                    default:
                        return res.status(400).json({ message: 'Invalid type. Use "user", "product", or "category".' });
                }

                res.status(200).json({ message: 'Promotion applied successfully' });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });




        // // user can create order
        // app.post('/create-order', async (req, res) => {
        //     const { amount, products_id_array, created_at, user_id, status, delivery } = req.body;

        //     try {
        //         // Validate that products exist before creating the order
        //         const products = await Product.find({ _id: { $in: products_id_array } });

        //         if (products.length !== products_id_array.length) {
        //             return res.status(400).json({ message: 'One or more products do not exist.' });
        //         }

        //         // Create the order
        //         const order = new Order({
        //             amount,
        //             products: products_id_array,
        //             created_at,
        //             user_id,
        //             status,
        //             delivery
        //         });

        //         // Save the order to the database
        //         await order.save();

        //         res.status(201).json({ message: 'Order created successfully', order });
        //     } catch (error) {
        //         res.status(500).json({ message: error.message });
        //     }
        // });




        // app.get('/product-details/:productId', isAdmin, async (req, res) => {
        //     const productId = req.params.productId;

        //     try {
        //         // Find the product by ID
        //         const product = await Product.findById(productId);

        //         if (!product) {
        //             return res.status(404).json({ message: 'Product not found with the provided ID.' });
        //         }

        //         // Return the product details
        //         res.json(product);
        //     } catch (error) {
        //         res.status(500).json({ message: error.message });
        //     }
        // });





        // // Endpoint for searching products by name
        // app.get('/product-search/:productName', isAdmin, async (req, res) => {
        //     const productName = req.params.productName;

        //     try {
        //         // Find products by name (case-insensitive search)
        //         const products = await Product.find({ name: { $regex: new RegExp(productName, 'i') } });

        //         if (products.length === 0) {
        //             return res.status(404).json({ message: 'No products found with the provided name.' });
        //         }

        //         // Return the list of products matching the search criteria
        //         res.json(products);
        //     } catch (error) {
        //         res.status(500).json({ message: error.message });
        //     }
        // });


        // // Email sending endpoint
        // app.post('/send-email', async (req, res) => {
        //     const { to, subject, text } = req.body;

        //     // Create a nodemailer transporter
        //     const transporter = nodemailer.createTransport({
        //         service: 'gmail',
        //         auth: {
        //             user: 'your-email@gmail.com', // replace with your email
        //             pass: 'your-email-password'  // replace with your email password
        //         }
        //     });

        //     // Define the email options
        //     const mailOptions = {
        //         from: 'your-email@gmail.com', // replace with your email
        //         to,
        //         subject,
        //         text
        //     };

        //     try {
        //         // Send the email
        //         const info = await transporter.sendMail(mailOptions);
        //         console.log('Email sent:', info.response);

        //         // Respond to the client
        //         res.json({ message: 'Email sent successfully' });
        //     } catch (error) {
        //         console.error('Error sending email:', error);
        //         res.status(500).json({ message: 'Error sending email' });
        //     }
        // });


        // // Schedule a cron job to run every day at a specific time
        // cron.schedule('0 0 * * *', async () => {
        //     // Iterate through users and send reminders
        //     users.forEach(async (user) => {
        //         const timeSinceLastOrder = Date.now() - user.lastOrderTimestamp;
        //         const hoursSinceLastOrder = timeSinceLastOrder / (60 * 60 * 1000);

        //         if (hoursSinceLastOrder >= 24) {
        //             try {
        //                 // Send a reminder message
        //                 const response = await client.messages.create({
        //                     from: 'whatsapp:+14155238886',  // replace with your Twilio WhatsApp-enabled phone number
        //                     to: user.phoneNumber,
        //                     body: 'Hey! It looks like you haven\'t placed an order in the last 24 hours. Why not check out our latest products?',
        //                 });

        //                 console.log('Reminder message sent:', response);
        //             } catch (error) {
        //                 console.error('Error sending reminder message:', error);
        //             }
        //         }
        //     });
        // });




        // // Endpoint for canceling an order
        // app.post('/cancel-order/:orderId', async (req, res) => {
        //     const orderId = parseInt(req.params.orderId);

        //     try {
        //         // Find the order by orderId
        //         const order = await Order.findOne({ orderId });

        //         if (!order) {
        //             return res.status(404).json({ message: 'Order not found with the provided ID.' });
        //         }

        //         // Check if the order can be canceled (e.g., it's in a pending state)
        //         if (order.status !== 'pending') {
        //             return res.status(400).json({ message: 'Cannot cancel an order that is not in a pending state.' });
        //         }

        //         // Update the order status to "canceled"
        //         order.status = 'canceled';
        //         await order.save();

        //         // Respond with a success message
        //         res.json({ message: 'Order canceled successfully.' });
        //     } catch (error) {
        //         console.error('Error canceling order:', error);
        //         res.status(500).json({ message: 'Error canceling order' });
        //     }
        // });


        // // create ticket  
        // app.post('/create-ticket', async (req, res) => {
        //     const { customerName, issue } = req.body;

        //     try {
        //         const newTicket = new SupportTicket({
        //             customerName,
        //             issue,
        //         });

        //         const savedTicket = await newTicket.save();
        //         res.json(savedTicket);
        //     } catch (error) {
        //         console.error('Error creating ticket:', error);
        //         res.status(500).json({ message: 'Error creating ticket' });
        //     }
        // });



        // // reply 
        // app.post('/reply-to-ticket/:ticketId', async (req, res) => {
        //     const { user, message } = req.body;
        //     const ticketId = req.params.ticketId;

        //     try {
        //         const ticket = await SupportTicket.findById(ticketId);

        //         if (!ticket) {
        //             return res.status(404).json({ message: 'Ticket not found with the provided ID.' });
        //         }

        //         ticket.replies.push({ user, message });
        //         await ticket.save();

        //         res.json(ticket);
        //     } catch (error) {
        //         console.error('Error replying to ticket:', error);
        //         res.status(500).json({ message: 'Error replying to ticket' });
        //     }
        // });



    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
    });
