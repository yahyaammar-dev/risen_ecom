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
const Store = require('./models/Store')
const SupportTicket = require('./models/SupportTicket')
const Schedule = require('./models/Schedule')


// connecting to db
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/ecom_db')
    .then(async () => {
        // Routes

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        // Get all stores
        app.get('/get-all-stores', async (req, res) => {
            try {
                const stores = await Store.find();
                res.status(200).json({ stores });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });


        // Admin should be able to login by selecting a branch
        app.post('/adminlogin', async (req, res) => {
            const { email, password, branchName } = req.body;
            try {
                if (email == 'admin@gmail.com' && password == 'qw4hd') {
                    res.status(200).json({
                        message: 'superadmin',
                        admin: 'superadmin'
                    })
                    return
                }
                const admin = await Admin.findOne({ email, password, branchName });
                if (admin) {
                    res.status(200).json({ admin })
                    // if (admin.role === 'superadmin' || admin.branchName === branchName) {
                    //     const data = {
                    //         ...admin, 
                    //         branchName
                    //     }
                    //     res.json(data);
                    // } else {
                    //     res.status(403).json({ message: 'Access denied. Admin does not have access to the specified branch.' });
                    // }
                } else {
                    res.status(404).json({ message: 'Admin not found with the provided credentials.' });
                }
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        })



        // get all suppport tickets 
        app.get('/get-support-tickets', async (req, res) => {
            try {
                const supportTickets = await SupportTicket.find();
                res.status(200).json({ supportTickets });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });



        // Email sending endpoint
        app.get('/send-email', async (req, res) => {

            // Create a nodemailer transporter
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'yahyaammar4807@gmail.com', // replace with your email
                    pass: 'qw4hddqcrg*'  // replace with your email password
                }
            });

            // Define the email options
            const mailOptions = {
                from: 'yahyaammar4807@gmail.com', // replace with your email
                to: 'pebihog804@bustayes.com',
                subject: 'This is subject',
                text: 'This is text'
            };

            try {
                // Send the email
                const info = await transporter.sendMail(mailOptions);
                console.log('Email sent:', info.response);

                // Respond to the client
                res.json({ message: 'Email sent successfully' });
            } catch (error) {
                console.error('Error sending email:', error);
                res.status(500).json({ message: 'Error sending email' });
            }
        });




        // get product details
        app.get('/product-details/:productId', async (req, res) => {
            const productId = req.params.productId;

            try {
                // Find the product by ID
                const product = await Product.findById(productId);

                if (!product) {
                    return res.status(404).json({ message: 'Product not found with the provided ID.' });
                }

                // Return the product details
                res.json(product);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });



        // get product details
        app.get('/category-detail/:productId', async (req, res) => {
            const productId = req.params.productId;

            try {
                // Find the product by ID
                const product = await Category.findById(productId);

                if (!product) {
                    return res.status(404).json({ message: 'Product not found with the provided ID.' });
                }

                // Return the product details
                res.json(product);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });



        // delete the product   
        app.delete('/delete-products', async (req, res) => {
            try {
                const branchId = req.query.branchId;
                const id = req.query.id;

                // Check if branchId and id are provided
                if (!branchId || !id) {
                    res.status(400).json({ error: 'Both branchId and id are required parameters' });
                    return;
                }

                // Validate branchId and id format
                if (!ObjectId.isValid(branchId) || !ObjectId.isValid(id)) {
                    res.status(400).json({ error: 'Invalid branchId or id format' });
                    return;
                }

                // Check if the product exists before deleting
                const existingProduct = await Product.findById(new ObjectId(id)); // Create a new instance of ObjectId
                if (!existingProduct) {
                    res.status(404).json({ error: 'Product not found' });
                    return;
                }

                // Check if the product belongs to the specified branch
                if (existingProduct.branchId.toString() !== branchId) {
                    res.status(403).json({ error: 'Product does not belong to the specified branch' });
                    return;
                }

                // Delete the product
                const deletedProduct = await Product.findByIdAndDelete(new ObjectId(id)); // Create a new instance of ObjectId
                res.status(200).json({ success: true, deletedProduct });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });







        // delete the category   
        app.delete('/delete-category', async (req, res) => {
            try {
                const branchId = req.query.branchId;
                const id = req.query.id;

                // Check if branchId and id are provided
                if (!branchId || !id) {
                    res.status(400).json({ error: 'Both branchId and id are required parameters' });
                    return;
                }

                // Validate branchId and id format
                if (!ObjectId.isValid(branchId) || !ObjectId.isValid(id)) {
                    res.status(400).json({ error: 'Invalid branchId or id format' });
                    return;
                }

                // Check if the product exists before deleting
                const existingProduct = await Category.findById(new ObjectId(id)); // Create a new instance of ObjectId
                if (!existingProduct) {
                    res.status(404).json({ error: 'Product not found' });
                    return;
                }

                // Check if the product belongs to the specified branch
                if (existingProduct.branchId.toString() !== branchId) {
                    res.status(403).json({ error: 'Product does not belong to the specified branch' });
                    return;
                }

                // Delete the product
                const deletedProduct = await Category.findByIdAndDelete(new ObjectId(id)); // Create a new instance of ObjectId
                res.status(200).json({ success: true, deletedProduct });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });




        // delete the product   
        app.delete('/delete-notification', async (req, res) => {
            try {
                const branchId = req.query.branchId;
                const id = req.query.id;


                // Check if branchId and id are provided
                if (!branchId || !id) {
                    res.status(400).json({ error: 'Both branchId and id are required parameters' });
                    return;
                }

                // Validate branchId and id format
                if (!ObjectId.isValid(branchId) || !ObjectId.isValid(id)) {
                    res.status(400).json({ error: 'Invalid branchId or id format' });
                    return;
                }

                // Check if the product exists before deleting
                const existingProduct = await Notification.findById(new ObjectId(id)); // Create a new instance of ObjectId
                if (!existingProduct) {
                    res.status(404).json({ error: 'Product not found' });
                    return;
                }

                // Check if the product belongs to the specified branch
                if (existingProduct.branchId.toString() !== branchId) {
                    res.status(403).json({ error: 'Product does not belong to the specified branch' });
                    return;
                }

                // Delete the product
                const deletedProduct = await Notification.findByIdAndDelete(new ObjectId(id)); // Create a new instance of ObjectId
                res.status(200).json({ success: true, deletedProduct });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
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



        // get product details
        app.get('/get-notification', async (req, res) => {
            const productId = req.query.id;

            try {
                // Find the product by ID
                const product = await Notification.findById(productId);

                if (!product) {
                    return res.status(404).json({ message: 'Notification not found with the provided ID.' });
                }

                // Return the product details
                res.json(product);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });





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



        // admin should be able to create users 
        app.post('/register', async (req, res) => {
            const { name, email, password } = req.body;

            try {
                // Create a new category
                const user = new User({
                    name: name,
                    email: email,
                    password: password
                });

                // Save the category to the database
                await user.save();

                res.status(201).json({ message: 'User created successfully', user });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });





        // Update the notification
        app.put('/update-notifcation', async (req, res) => {
            try {
                const { id, text, type, branchId } = req.body;

                // Define the data object
                const data = {
                    text,
                    type,
                    branchId,
                    id
                };

                // Find and update the document, returning the original document before the update
                const updatedProduct = await Notification.findOneAndUpdate(
                    { _id: id, branchId: branchId },
                    { $set: data },
                    { new: true } // Return the updated document
                );


                if (updatedProduct) {
                    return res.status(200).json(updatedProduct);
                } else {
                    return res.status(404).json({ error: 'Notifcation not found' });
                }
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        });



        // Update the product
        app.put('/update-product', async (req, res) => {
            try {
                const { barcode, name, category, description, branchId } = req.body;

                // Define the data object
                const data = {
                    barcode,
                    name,
                    category,
                    description,
                    branchId
                };


                // Find and update the document, returning the original document before the update
                const updatedProduct = await Product.findOneAndUpdate(
                    { barcodeId: barcode, branchId: branchId },
                    { $set: data },
                    { new: true } // Return the updated document
                );

                if (updatedProduct) {
                    return res.status(200).json(updatedProduct);
                } else {
                    return res.status(404).json({ error: 'Product not found' });
                }
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        });



        // Update the product
        app.put('/update-category', async (req, res) => {
            try {

                console.log('hello world')

                const { id, name, branchId } = req.body;

                // Define the data object
                const data = {
                    id,
                    name,
                    branchId
                };


                // Find and update the document, returning the original document before the update
                const updatedProduct = await Category.findOneAndUpdate(
                    { _id:id, branchId: branchId },
                    { $set: data },
                    { new: true } // Return the updated document
                );

                if (updatedProduct) {
                    return res.status(200).json(updatedProduct);
                } else {
                    return res.status(404).json({ error: 'Product not found' });
                }
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
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
                for (const data of jsonData) {
                    const barcode = data.barcodeId;
                    const barcodeId = data.barcodeId;

                    const existingProduct = await Product.findOne({ barcodeId: barcode });



                    // find branch name here 
                    // find category here
                    // find images url



                    if (existingProduct) {

                        // Update the existing product if it already exists
                        const updatedProduct = await Product.updateOne({ barcodeId }, { $set: { ...data } });
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
                console.log(error)
                res.status(500).json({ message: error.message });
            }
        });


        // admin should be able to read notification  
        app.get('/read-notification', async (req, res) => {
            try {
                const branchId = req.query.branchId;

                // Check if branchId is provided
                if (!branchId) {
                    res.status(404).json('Branch id not found');
                    return
                }

                const notifcations = await Notification.find({ 'branchId': branchId });
                res.status(200).json({ notifcations });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });


        // admin should be able to create notification  
        app.post('/create-notification', async (req, res) => {
            const { text, type, branchId } = req.body;

            try {
                // Create a new notification
                const notification = new Notification({
                    text,
                    type,
                    branchId
                });

                // Save the notification to the database
                const response = await notification.save();

                res.status(201).json({ message: 'Notification created successfully', response });
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


        // Get all users for a specific branch
        app.get('/get-all-users', async (req, res) => {
            try {
                const branchId = req.query.branchId;

                // Check if branchId is provided
                if (!branchId) {
                    const users = await User.find();
                    res.status(200).json({ users });
                    return
                }

                const users = await User.find({ 'branch': branchId });
                res.status(200).json({ users });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });




        // admin should be able to see list of orders
        app.get('/get-all-orders', async (req, res) => {
            const branchId = req.query.branchId;
            try {
                // Find the branch to ensure it exists
                const branch = await Store.findById(branchId);

                if (!branch) {
                    const orders = await Order.find()
                        .populate('user', 'name email')  // Assuming 'name' and 'email' are fields in the User model
                        .populate('products', 'name description');  // Assuming 'name' and 'description' are fields in the Product model

                    res.json({ orders });
                    return
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



        // Define your API endpoint for saving schedule data
        app.post('/schedule', async (req, res) => {
            try {
                const { schedule1, schedule2, schedule3 } = req.body;

                // Create a new schedule instance
                const newSchedule = new Schedule({
                    schedule1,
                    schedule2,
                    schedule3,
                });

                // Save the schedule to the database
                await newSchedule.save();

                res.status(201).json({ message: 'Schedule saved successfully' });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });




        // Get all products
        app.get('/get-all-products', async (req, res) => {
            try {
                const branchId = req.query.branchId;
                const products = await Product.find({ branchId: branchId });
                res.status(200).json({ products });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });


        /// Get all categories
        app.get('/get-categories', async (req, res) => {
            try {
                const branchId = req.query.branchId;
                const categories = await Category.find({ branchId: branchId });
                console.log(branchId)
                res.status(200).json({ categories });
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
        app.post('/assign-promotion', async (req, res) => {
            const { type, typeId, promoCodeName } = req.body;

            try {
                // Find the promo code by ID
                const promoCode = await PromoCode.find({ name: promoCodeName });

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





        // email to people who have not placed order 


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

        // API Endpoint to send email to users who haven't placed an order
        app.post('/send-email-to-non-order-users', async (req, res) => {
            try {
                const nonOrderUsers = await getNonOrderUsers(db);
                await sendEmails(nonOrderUsers);

                res.json({ success: true, message: 'Emails sent successfully.' });
            } catch (error) {
                console.error('Error sending emails:', error);
                res.status(500).json({ success: false, message: 'Internal server error.' });
            }
        });

        // Helper function to get users who haven't placed an order
        async function getNonOrderUsers(db) {
            const nonOrderUsers = await db.collection('users').aggregate([
                {
                    $lookup: {
                        from: 'orders',
                        localField: '_id',
                        foreignField: 'user',
                        as: 'userOrders'
                    }
                },
                {
                    $match: {
                        userOrders: { $size: 0 }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        username: 1,
                        email: 1
                        // Add other fields you want to include in the result
                    }
                }
            ]).toArray();

            return nonOrderUsers;
        }

        // Helper function to send emails
        async function sendEmails(users) {
            const transporter = nodemailer.createTransport({
                // Configure your email transport options here (e.g., SMTP, OAuth2)
            });

            for (const user of users) {
                const mailOptions = {
                    from: 'your_email@example.com',
                    to: user.email,
                    subject: 'Reminder: Place Your First Order',
                    text: `Dear ${user.username},\n\nYou have not placed an order yet. Visit our website and explore our products.\n\nRegards,\nThe Team`
                };

                await transporter.sendMail(mailOptions);
            }
        }





    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
    });
