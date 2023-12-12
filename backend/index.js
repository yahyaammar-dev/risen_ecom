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
const moment = require('moment');

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
const Order = require('./models/Order');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Notification = require('./models/Notification')
const PromoCode = require('./models/PromoCode');
const Store = require('./models/Store')
const SupportTicket = require('./models/SupportTicket')
const Schedule = require('./models/Schedule')
const Area = require('./models/Area')
const SubCategory = require('./models/SubCategory')

// connecting to db
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/ecom_db')
    .then(async () => {
        // Routes

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });


        // Get all Areas
        app.get('/get-areas', async (req, res) => {
            try {
                const areas = await Area.find({});
                res.status(200).json(areas);
            } catch (error) {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });


        app.post('/get-subcategories', async (req, res) => {
            try {
                // Extract parentCategoryId from the request body
                const { parentCategoryId } = req.body;
        
                // Query the database to find all subcategories with the specified parentCategoryId
                const subcategories = await SubCategory.find({ parentCategoryId });
        
                // Return the list of subcategories
                res.status(200).json(subcategories);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });


        // Get all products
        app.get('/orders', async (req, res) => {
            try {
                const branchId = req.query.branchId;
                const orders = await Order.find({});
                res.status(200).json({ orders });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
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
        });

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

        // Subcategory Creation API
        app.post('/subcategories', async (req, res) => {
            try {
                const newSubCategory = new SubCategory(req.body);
                const savedSubCategory = await newSubCategory.save();
                res.status(201).json(savedSubCategory);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        // Get all Subcategories API
        app.get('/subcategories', async (req, res) => {
            try {
                const subcategories = await SubCategory.find();
                res.status(200).json(subcategories);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
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


        // get all users
        app.post('/users', async (req, res) => {
            try {
                const newUser = new Admin(req.body);
                const savedUser = await newUser.save();
                res.status(201).json(savedUser);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        // admin should be able to see order detail
        app.post('/order-details', async (req, res) => {
            const { orderId } = req.body;
            try {
                const order = await Order.findById(orderId).populate('user').populate('products');
                if (!order) {
                    return res.status(404).json({ message: 'Order not found with the provided ID.' });
                }
                res.json(order);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Create Category API
        app.post('/create-category', upload.single('categoryImage'), async (req, res) => {
            const { categoryName } = req.body;

            try {
                // Create a new category
                const category = new Category({
                    name: categoryName,
                    image: req.file.path,
                });

                // Save the category to the database
                await category.save();

                res.status(201).json({ message: 'Category created successfully', category });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Create Category API
        app.post('/create-branch', async (req, res) => {
            const { branchName, address, latitude, longitude } = req.body;

            console.log(req.body, branchName, address)

            try {
                // Create a new category
                const branch = new Store({
                    name: branchName,
                    address: address, 
                    latitidue: latitude, 
                    longitude: longitude
                });

                // Save the category to the database
                await branch.save();

                res.status(201).json({ message: 'Branch created successfully', branch });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });


        // checking otp here
        app.post('/checkotp', async (req, res) => {
            const { otp, email } = req.body;

            try {
                // Find the user by email
                const user = await User.findOne({ email });

                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }

                // Check if the provided OTP matches the stored OTP
                if (user.otp !== otp) {
                    return res.status(403).json({ message: 'Invalid OTP' });
                }

                // Clear the OTP after successful verification (optional)
                user.otp = null;
                await user.save();
                res.status(200).json({ message: 'OTP verification successful', user });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });


        // admin should be able to create users 
        app.post('/register', async (req, res) => {
            const { name, email, password } = req.body;

            var otp = Math.floor(Math.random() * 900000) + 100000;

            try {
                // Create a new category
                const user = new User({
                    name: name,
                    email: email,
                    password: password,
                    otp
                });

                // Save the category to the database
                await user.save();

                res.status(201).json({ message: 'User created successfully', user });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Login API
        app.post('/login', async (req, res) => {
            const { email, password } = req.body;

            try {
                // Find the user by email
                const user = await User.findOne({ email, password });

                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }

                res.status(200).json({ message: 'Login successful', user });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
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
        app.put('/update-product', upload.array('image[]'), async (req, res) => {
            try {
                const { barcode, name, category, description, branchId } = req.body;

                // Get the file paths from Multer
                const newImages = req.files.map(file => file.path);

                // Find and update the document, returning the original document before the update
                const updatedProduct = await Product.findOneAndUpdate(
                    { barcodeId: barcode, branchId: branchId },
                    {
                        $set: {
                            name,
                            category,
                            description,
                            branchId,
                        },
                        $push: { images: { $each: newImages } }, // Append new images
                    },
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
                    { _id: id, branchId: branchId },
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
            const { name, description, amount, category, barcodeId, branch } = req.body;
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
                    barcodeId: barcodeId,
                    branch: branch
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
            const filePath = req.file ? req.file.path : null;

            try {
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
            const { name, percentage, type, validTill, branchId } = req.body;

            try {
                // Create a new promotion
                const promotion = new PromoCode({
                    name,
                    percentage,
                    type,
                    validTill,
                    branchId
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

        // Get all categories
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

        // Get all categories
        app.get('/get-all-categories', async (req, res) => {
            try {
                const branchId = req.query.branchId;
                const categories = await Category.find({ branchId: branchId });
                res.status(200).json({ categories });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Get all promocodes
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

                if (!promoCode || !(promoCode.length > 0)) {
                    return res.status(404).json({ message: 'PromoCode not found with the provided ID.' });
                }

                // Apply the promo code to the specified type (user, product, or category)
                switch (type) {
                    case 'user':
                        const user = await User.findById(typeId);
                        if (user) {
                            user.promoCode = promoCode[0]._id;
                            const response = await user.save();
                        } else {
                            return res.status(404).json({ message: 'User not found with the provided ID.' });
                        }
                        break;
                    case 'product':
                        const product = await Product.findById(typeId);
                        if (product) {
                            product.promoCode = promoCode[0]._id;
                            const response = await product.save();

                        } else {
                            return res.status(404).json({ message: 'Product not found with the provided ID.' });
                        }
                        break;
                    case 'category':
                        const category = await Category.findById(typeId);
                        if (category) {
                            category.promoCode = promoCode[0]._id;
                            const response = await category.save();
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


        // update the promocode
        app.put('/update-promo-code', async (req, res) => {
            try {
                const id = req.body.id;
                const data = req.body;
                const promoCode = await PromoCode.findByIdAndUpdate(id, data, { new: true });
                if (!promoCode) {
                    return res.status(404).json({ error: 'Promo code not found' });
                }
                res.status(200).json({ promoCode });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        })

        app.delete('/delete-promo', async (req, res) => {
            try {
                const id = req.query.id
                const promoCode = await PromoCode.findOneAndDelete(id);
                res.status(200).json({ promoCode });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        })


        // Get all promocode for a specific branch
        app.get('/promo-code-details', async (req, res) => {
            try {
                const branchId = req.query.branchId;
                const id = req.query.id

                // Check if branchId is provided
                if (!branchId) {
                    const users = await User.find();
                    res.status(200).json({ users });
                    return
                }

                const promoCode = await PromoCode.findById({ '_id': id });
                res.status(200).json({ promoCode });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Create Order
        app.post('/create-order', async (req, res) => {
            const { amount, branchId, products, user } = req.body;

            try {

                let pros = []
                products.forEach(element => {
                    pros.push(element?.id)
                });
                let user_id = user?.id

                // Create a new product
                const order = new Order({
                    amount,
                    branchId,
                    products,
                    user_id
                });

                const admins = Admin.find({ branch: branchId })

                console.log('They will get email', admins)

                // Save the product to the database
                await product.save();

                res.status(201).json({ message: 'Product created successfully', product });
            } catch (error) {
                res.status(500).json({ message: error.message });
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



        // get user orders this month

        app.get('/user-orders-this-month', async (req, res) => {
            const userEmail = req.query.email; // Assuming the email is passed as a query parameter

            try {
                // Find the user by email
                const user = await User.findOne({ email: userEmail });

                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }

                // Get the first and last day of the current month
                const startOfMonth = moment().startOf('month');
                const endOfMonth = moment().endOf('month');

                // Find orders for the current month
                const orders = await Order.find({
                    user_id: user._id,
                    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
                });

                res.status(200).json({ message: 'User orders for the current month', orders });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
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


        // create ticket  
        app.post('/create-ticket', async (req, res) => {
            const { customerName, email, issue } = req.body;

            try {
                const newTicket = new SupportTicket({
                    customerName,
                    issue,
                    email
                });

                const savedTicket = await newTicket.save();
                res.json(savedTicket);
            } catch (error) {
                console.error('Error creating ticket:', error);
                res.status(500).json({ message: 'Error creating ticket' });
            }
        });



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
