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
const emailjs = require('@emailjs/nodejs');

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


const uploadsDirectory = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDirectory));

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
const Favourite = require('./models/favourte')
const Location = require('./models/location')
const Section = require('./models/Section')


// connecting to db
const mongoose = require('mongoose');
const WolletteData = require('./models/WolleteData');
const WebHooksData = require('./models/WebHooksData');
mongoose.connect('mongodb://127.0.0.1:27017/ecom_db')
    .then(async () => {
        // Routes
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });


        app.get('/search-product', async (req, res) => {
            try {
                const searchQuery = req.query.data;
                console.log(searchQuery);

                let filter;

                if (searchQuery) {
                    filter = {
                        $or: [
                            { name: { $regex: searchQuery, $options: 'i' } }, // 'i' makes it case-insensitive
                            { barcodeId: { $regex: searchQuery, $options: 'i' } },
                            { promoCode: { $regex: searchQuery, $options: 'i' } }
                        ]
                    };
                } else {
                    // If searchQuery is empty, return all products
                    filter = {};
                }

                const products = await Product.find(filter).populate("category");

                if (products.length > 0) {
                    res.status(200).json({ products });
                } else {
                    res.status(404).json({ message: 'No matching entries found' });
                }
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }


        });

        app.get('/search-branch', async (req, res) => {
            try {
                const searchQuery = req.query.data;
                console.log(searchQuery);

                let filter;

                if (searchQuery) {
                    filter = {
                        $or: [
                            { name: { $regex: searchQuery, $options: 'i' } }, // 'i' makes it case-insensitive
                            { address: { $regex: searchQuery, $options: 'i' } },
                            { latitude: { $regex: searchQuery, $options: 'i' } },
                            { longitude: { $regex: searchQuery, $options: 'i' } }
                        ]
                    };
                } else {
                    // If searchQuery is empty, return all products
                    filter = {};
                }

                const branches = await Store.find(filter);

                if (branches.length > 0) {
                    res.status(200).json({ branches });
                } else {
                    res.status(404).json({ message: 'No matching entries found' });
                }
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }


        });

        app.get('/search-user', async (req, res) => {
            try {
                const searchQuery = req.query.data;
                console.log(searchQuery);

                let filter;

                if (searchQuery) {
                    filter = {
                        $or: [
                            { name: { $regex: searchQuery, $options: 'i' } }, // 'i' makes it case-insensitive
                            { email: { $regex: searchQuery, $options: 'i' } },
                            { phone: { $regex: searchQuery, $options: 'i' } }
                        ]
                    };
                } else {
                    // If searchQuery is empty, return all products
                    filter = {};
                }

                const users = await User.find(filter)

                if (users.length > 0) {
                    res.status(200).json({ users });
                } else {
                    res.status(404).json({ message: 'No matching entries found' });
                }
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }


        });

        app.get('/search-category', async (req, res) => {
            try {
                const searchQuery = req.query.data;
                console.log(searchQuery);

                let filter;

                if (searchQuery) {
                    filter = {
                        $or: [
                            { name: { $regex: searchQuery, $options: 'i' } }
                        ]
                    };
                } else {
                    // If searchQuery is empty, return all products
                    filter = {};
                }

                const categories = await Category.find(filter);

                if (categories.length > 0) {
                    res.status(200).json({ categories });
                } else {
                    res.status(404).json({ message: 'No matching entries found' });
                }
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }


        });

        app.get('/search-subcategory', async (req, res) => {
            try {
                const searchQuery = req.query.data;
                console.log(searchQuery);

                let filter;

                if (searchQuery) {
                    filter = {
                        $or: [
                            { subCategoryName: { $regex: searchQuery, $options: 'i' } }
                        ]
                    };
                } else {
                    // If searchQuery is empty, return all products
                    filter = {};
                }

                const subcategories = await SubCategory.find(filter);

                if (subcategories.length > 0) {
                    res.status(200).json({ subcategories });
                } else {
                    res.status(404).json({ message: 'No matching entries found' });
                }
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }


        });
        app.get('/search-section', async (req, res) => {
            try {
                const searchQuery = req.query.data;
                console.log(searchQuery);

                let filter;

                if (searchQuery) {
                    filter = {
                        $or: [
                            { name: { $regex: searchQuery, $options: 'i' } }
                        ]
                    };
                } else {
                    // If searchQuery is empty, return all products
                    filter = {};
                }

                const sections = await Section.find(filter);

                if (sections.length > 0) {
                    res.status(200).json({ sections });
                } else {
                    res.status(404).json({ message: 'No matching entries found' });
                }
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }


        });

        app.get('/product-by-category', async (req, res) => {
            try {
                const categoryId = req.query.id;
                console.log(categoryId)
                const products = await Product.find({ category: categoryId }).populate('category');
                res.status(200).json({ products });
            } catch (error) {
                console.error('Error:', error);
                throw error; // You may want to handle this error in a more specific way in your application
            }
        });


        app.get('/subcategory-by-category', async (req, res) => {
            try {
                const categoryId = req.query.id;
                console.log(categoryId)
                const subcategories = await SubCategory.find({ parentCategoryId : categoryId }).populate('parentCategoryId');
                res.status(200).json({ subcategories });
            } catch (error) {
                console.error('Error:', error);
                throw error; // You may want to handle this error in a more specific way in your application
            }
        });



        app.get('/get-webhook-data', async (req, res) => {
            try {
                const storedData = await WebHooksData.find({});
                if (storedData) {
                    res.status(200).json({ message: 'Data retrieved successfully', data: storedData });
                } else {
                    res.status(404).json({ message: 'Data not found' });
                }
            } catch (error) {
                console.error('Error inserting data into MongoDB:', error);
                res.status(500).send('Internal Server Error');
            }
        });



        app.post('/webhook', async (req, res) => {
            const webhookData = req.body;
            console.log('Received webhook data:', webhookData);
            try {
                // Create a new document using the WebhookData model
                const newWebhookData = new WebHooksData({data: webhookData});
                // Save the document to MongoDB
                await newWebhookData.save();
                console.log('Webhook data inserted into MongoDB');
                res.status(200).send('Webhook received successfully');
            } catch (error) {
                console.error('Error inserting data into MongoDB:', error);
                res.status(500).send('Internal Server Error');
            }
        });


        app.post('/store-wollette-data', async (req, res) => {
            try {
                const { deviceId, locationId, staffId, customerId, type, json } = req.body;
                const newData = new WolletteData({
                    deviceId,
                    locationId,
                    staffId,
                    type,
                    json
                });
                await newData.save();
                res.status(200).json({ message: 'Data stored successfully' });
                return
            } catch (error) {
                console.error('Error Storing Data:', error);
                res.status(500).json({ message: 'Error Storing Data', error: error.message });
                return
            }
        })


        app.post('/get-wollette-data', async (req, res) => {
            try {
                const { deviceId, locationId, staffId } = req.body;

                // Search for the data based on the provided deviceId, locationId, and staffId
                const storedData = await WolletteData.find({ deviceId, locationId, staffId });

                if (storedData) {
                    res.status(200).json({ message: 'Data retrieved successfully', data: storedData });
                } else {
                    res.status(404).json({ message: 'Data not found' });
                }
            } catch (error) {
                console.error('Error Retrieving Data:', error);
                res.status(500).json({ message: 'Error Retrieving Data', error: error.message });
            }
        });


        // Update Branch API
        app.put('/update-branch/:branchId', async (req, res) => {
            try {
                const branchId = req.params.branchId;
                const { branchName, address, latitude, longitude } = req.body;

                // Check if branchId is provided
                if (!branchId) {
                    return res.status(400).json({ message: 'Branch ID is required for updating a branch' });
                }

                // Find the branch by ID
                const existingBranch = await Store.findById(branchId);

                // Check if the branch exists
                if (!existingBranch) {
                    return res.status(404).json({ message: 'Branch not found' });
                }

                // Update the branch properties
                existingBranch.name = branchName;
                existingBranch.address = address;
                existingBranch.latitude = latitude;
                existingBranch.longitude = longitude;

                // Save the updated branch to the database
                await existingBranch.save();

                res.status(200).json({ message: 'Branch updated successfully', branch: existingBranch });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });

        app.put('/update-branches', async (req, res) => {
            try {
                const branchId = req.query.id;
                console.log(req.query.id)
                const { branchName, address, latitude, longitude } = req.body;
                console.log(req.body)
                // Check if branchId is provided
                if (!branchId) {
                    return res.status(400).json({ message: 'Branch ID is required for updating a branch' });
                }

                // Find the branch by ID
                const existingBranch = await Store.findById(branchId);

                // Check if the branch exists
                if (!existingBranch) {
                    return res.status(404).json({ message: 'Branch not found' });
                }

                // Update the branch properties
                existingBranch.name = branchName;
                existingBranch.address = address;
                existingBranch.latitude = latitude;
                existingBranch.longitude = longitude;

                // Save the updated branch to the database
                await existingBranch.save();

                res.status(200).json({ message: 'Branch updated successfully', branch: existingBranch });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });










        app.put('/update-section/:sectionId', async (req, res) => {
            try {
                // Extract data from the request body
                const { name, percentage, productIds } = req.body;
                const sectionId = req.params.sectionId;

                // Check if sectionId is provided
                if (!sectionId) {
                    return res.status(400).json({ message: 'Section ID is required for updating a section' });
                }

                // Find the section by ID
                const existingSection = await Section.findById(sectionId);

                // Check if the section exists
                if (!existingSection) {
                    return res.status(404).json({ message: 'Section not found' });
                }

                // Update the section properties
                existingSection.name = name;
                existingSection.percentage = percentage;
                // existingSection.products = productIds;

                // Save the updated section to the database
                await existingSection.save();

                res.status(200).json({ message: 'Section updated successfully', section: existingSection });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
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
        app.get('/get-locations', async (req, res) => {
            try {
                const loc = await Location.find({});
                console.log("locations are", loc)
                res.status(200).json(loc);
            } catch (error) {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.get('/get-favourite', async (req, res) => {
            try {
                const { id } = req.query;
                console.log(id);
                const areas = await Favourite.find({ user: id });
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


        app.get('/get-products-via-sub-category', async (req, res) => {
            const subcatid = req.query.id;
            const branch = req.query.branch;



            // For now
            const products = await Product.find({}).populate('category');

            res.json({
                products,
                parentCategory: {
                    name: "POP"
                }
            });
            return



            try {
                // Find a subcategory by its ID
                const subCategory = await SubCategory.findById(subcatid);

                if (!subCategory) {
                    return res.status(404).json({ message: 'Subcategory not found' });
                }

                // Find the parent category
                const parentCategory = await Category.findById(subCategory.parentCategoryId);

                if (!parentCategory) {
                    return res.status(404).json({ message: 'Parent category not found' });
                }

                // Find products with matching category and branch
                const products = await Product.find({
                    category: subCategory.parentCategoryId,
                    branch: branch
                });

                // Construct the response object with additional information
                const response = {
                    subCategory: {
                        id: subCategory._id,
                        name: subCategory.subCategoryName,
                        parentId: subCategory.parentCategoryId
                    },
                    parentCategory: {
                        id: parentCategory._id,
                        name: parentCategory.name
                    },
                    products: products
                };

                res.json(response);
            } catch (error) {
                console.error(error.message);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });





        // Get all sections with products 
        app.get('/sections', async (req, res) => {
            try {
                const sections = await Section.find({}).populate('products');
                res.status(200).json({ sections });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });







        // Get all products
        app.get('/orders', async (req, res) => {
            try {
                const branchId = req?.query?.branchId;
                if (branchId) {
                    const orders = await Order.find({}).populate('');
                    res.status(200).json({ orders });
                    return
                } else {
                    const orders = await Order.find({}).populate('user').populate('products');
                    res.status(200).json({ orders });
                    return
                }
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });


        // Get all branches
        app.get('/get-all-branches', async (req, res) => {
            try {
                const branches = await Store.find({});
                res.status(200).json({ branches });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        app.delete('/delete-branches', async (req, res) => {
            try {
                const id = req.query.id
                const branches = await Store.findByIdAndDelete(new ObjectId(id));
                res.status(200).json({ branches });
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

                res.json(product);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // get product details
        app.get('/category-detail/:categoryId', async (req, res) => {

            const categoryId = req.params.categoryId;
            try {
                // Find the product by ID
                const product = await Category.findById(categoryId);
                if (!product) {
                    res.status(404).json({ message: 'Product not found with the provided ID.' });
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
                // const branchId = req.query.branchId;
                const id = req.query.id;

                const deletedProduct = await Product.findByIdAndDelete(new ObjectId(id)); // Create a new instance of ObjectId
                res.status(200).json({ success: true, deletedProduct });

                // // Check if branchId and id are provided
                // if (!branchId || !id) {
                //     res.status(400).json({ error: 'Both branchId and id are required parameters' });
                //     return;
                // }

                // // // Validate branchId and id format
                // if (!ObjectId.isValid(branchId) || !ObjectId.isValid(id)) {
                //     console.log(id, branchId)
                //     res.status(400).json({ error: 'Invalid branchId or id format' });
                //     return;
                // }

            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // delete the category   
        app.delete('/delete-category', async (req, res) => {
            try {
                const branchId = req.query.branchId;
                const id = req.query.id;

                // Delete the product
                const deletedCategory = await Category.findByIdAndDelete(new ObjectId(id)); // Create a new instance of ObjectId
                res.status(200).json({ success: true, deletedCategory });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });


        // Get all users for a specific branch
        app.delete('/delete-user', async (req, res) => {
            try {
                const id = req.query.id;
                const deletedUser = await User.findByIdAndDelete(new ObjectId(id));
                res.status(200).json({ deletedUser });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });


        app.delete('/delete-subcategory', async (req, res) => {
            try {
                const branchId = req.query.branchId;
                const id = req.query.id;

                // Delete the product
                const deletedCategory = await SubCategory.findByIdAndDelete(new ObjectId(id)); // Create a new instance of ObjectId
                res.status(200).json({ success: true, deletedCategory });
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

        // Get all Subcategories API
        app.get('/get-all-subcategoriess', async (req, res) => {
            try {
                const subcategories = await SubCategory.find().populate('parentCategoryId');
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
                // const existingProduct = await Notification.findById(new ObjectId(id)); // Create a new instance of ObjectId
                // if (!existingProduct) {
                //     res.status(404).json({ error: 'Product not found' });
                //     return;
                // }

                // // Check if the product belongs to the specified branch
                // if (existingProduct.branchId.toString() !== branchId) {
                //     res.status(403).json({ error: 'Product does not belong to the specified branch' });
                //     return;
                // }

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
        app.get('/users', async (req, res) => {
            try {
                const users = await Admin.find({})
                console.log(users)
                res.status(201).json({ users });
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
        app.post('/favourite', async (req, res) => {
            try {
                const { data } = req.body;
                console.log(data);
                const data1 = {

                }
                const newdata = new Favourite(data);
                const saved = await newdata.save();
                res.status(200).json(saved);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.delete('/delete-favourite', async (req, res) => {
            try {
                const pid = req.query.id
                const favourite = await Favourite.findOneAndDelete({ product: pid });
                res.status(200).json({ favourite });
            } catch (error) {
                res.status(500).json({ message: error.message });
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
            const { categoryName, branchId } = req.body;

            try {
                // Create a new category
                const category = new Category({
                    name: categoryName,
                    branchId: branchId,
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

            try {
                // Create a new category
                const branch = new Store({
                    name: branchName,
                    address: address,
                    latitude: latitude,
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


                const nodemailer = require("nodemailer");

                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false, // `true` for port 465, `false` for all other ports
                    auth: {
                        user: "yahyaammar4807@gmail.com",
                        pass: "pvoz ulzc qfyp rbmn",
                    },
                });

                // async..await is not allowed in global scope, must use a wrapper
                async function main() {
                    // send mail with defined transport object
                    const info = await transporter.sendMail({
                        from: '"Maddison Foo Koch 👻" <yahyaamar4807@gmail.com>', // sender address
                        to: 'yahyaammar4807@gmail.com', // list of receivers
                        subject: "OTP ✔", // Subject line
                        text: otp.toString(), // plain text body
                        html: otp.toString(), // html body
                    });

                    console.log("Message sent: %s", info.messageId);
                    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
                }

                main().catch(console.error);

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
                const { id, text, type } = req.body;

                // Define the data object
                const data = {
                    text,
                    type,
                    id
                };

                // Find and update the document, returning the original document before the update
                const updatedProduct = await Notification.findOneAndUpdate(
                    { _id: id },
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
        const mongoose = require('mongoose');

        app.put('/update-product', upload.array('image[]'), async (req, res) => {
            try {
                if (req?.files) {
                    const { id, barcodeId, name, price, description } = req.body;
                    // Check if id is a valid ObjectId
                    if (!mongoose.Types.ObjectId.isValid(id)) {
                        return res.status(400).json({ error: 'Invalid product ID' });
                    }

                    const newImages = req?.files?.map(file => file.path);
                    const updatedProduct = await Product.findByIdAndUpdate(
                        { _id: id },
                        {
                            $set: {
                                name,
                                price,
                                description,
                                barcodeId,
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
                } else {
                    const { id, barcodeId, name, price, description } = req.body;
                    // Check if id is a valid ObjectId
                    if (!mongoose.Types.ObjectId.isValid(id)) {
                        return res.status(400).json({ error: 'Invalid product ID' });
                    }

                    const updatedProduct = await Product.findByIdAndUpdate(
                        { _id: id },
                        {
                            $set: {
                                name,
                                price,
                                description,
                                barcodeId,
                            }
                        },
                        { new: true } // Return the updated document
                    );

                    if (updatedProduct) {
                        return res.status(200).json(updatedProduct);
                    } else {
                        return res.status(404).json({ error: 'Product not found' });
                    }
                }
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        });


        // Update the product
        app.put('/update-category', upload.single('file'), async (req, res) => {
            try {
                const { id, name } = req.body;
                const image = req.file ? req.file.path : null;

                const data = {
                    name,
                    image
                };

                const updatedProduct = await Category.findOneAndUpdate(
                    { _id: id },
                    { $set: data },
                    { new: true } // Return the updated document
                );

                if (updatedProduct) {
                    return res.status(200).json(updatedProduct);
                } else {
                    return res.status(404).json({ error: 'Category not found' });
                }
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        });



        // Update the product
        app.put('/update-subcategory', async (req, res) => {
            try {


                const { id, subCategoryName } = req.body;

                // Define the data object
                const data = {
                    id,
                    subCategoryName
                };

                console.log(data)


                // Find and update the document, returning the original document before the update
                const updatedProduct = await SubCategory.findOneAndUpdate(
                    { _id: id },
                    { $set: data },
                    { new: true } // Return the updated document
                );

                if (updatedProduct) {
                    return res.status(200).json(updatedProduct);
                } else {
                    return res.status(404).json({ error: 'SubCategory not found' });
                }
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        });



        // admin should be able to create products
        app.post('/create-product', upload.array('images', 5), async (req, res) => {
            const { name, description, amount, category, barcodeId, subcategory, branchId } = req.body;
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
                    branchId: branchId,
                    subcategory: subcategory
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

                const notifcations = await Notification.find({});
                res.status(200).json({ notifcations });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        app.post('/dublicate-product', async (req, res) => {
            const { sourceBranchId, destinationBranchId } = req.body;
            console.log(req.body)
            try {
                // Find all products with the sourceBranchId
                const productsToDuplicate = await Product.find({ branchId: sourceBranchId });

                // Create copies of each product with the new destinationBranchId
                const duplicatedProducts = productsToDuplicate.map(product => ({
                    ...product.toObject(),
                    _id: undefined, // Exclude original ID to create a new entry
                    branchId: destinationBranchId // Set the destination branch ID
                }));

                // Insert the duplicated products into the database
                const insertedProducts = await Product.insertMany(duplicatedProducts);

                res.status(200).json({ message: 'Products duplicated successfully', data: insertedProducts });
            } catch (error) {
                res.status(500).json({ error: 'Unable to duplicate products', message: error.message });
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


        // update user
        // Endpoint to update a user
        app.post('/update-user', async (req, res) => {
            try {
                // Extract user details from the request body
                const { id, email, password } = req.body;

                // Find the user in the database based on the provided id
                const user = await User.findById(id);

                // If the user is found, update their details
                if (user) {
                    user.email = email || user.email; // Update email if provided
                    user.password = password || user.password; // Update password if provided

                    // Save the updated user to the database
                    const updatedUser = await user.save();

                    // Return the updated user
                    res.status(200).json(updatedUser);
                } else {
                    // If user with the provided id is not found
                    res.status(404).json({ error: 'User not found' });
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        // Get all users for a specific branch
        app.get('/get-all-users', async (req, res) => {
            try {
                const branchId = req.query.branchId;

                // Check if branchId is provided
                if (!branchId) {
                    console.log("up")
                    const users = await User.find();
                    res.status(200).json({ users });
                    return
                }
                console.log(branchId);
                const users = await User.find({ 'branch': branchId });
                console.log(users);
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
                        .populate('products', 'name description')
                        .populate('user', 'name email'); // Assuming 'name' and 'email' are fields in the User model
                    // Assuming 'name' and 'description' are fields in the Product model

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

        app.get('/get-last-schedule', async (req, res) => {
            try {
                const lastSchedule = await Schedule.find({}).sort({ _id: -1 }).limit(1);
                res.status(200).json({ lastSchedule });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Get all products
        app.get('/get-all-products', async (req, res) => {
            try {
                const branchId = req?.query?.branchId;
                if (branchId) {
                    const products = await Product.find({ branchId: branchId }).populate('category');
                    res.status(200).json({ products });
                } else {
                    const products = await Product.find().populate('category');
                    res.status(200).json({ products });
                }
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Get all categories
        app.get('/get-categories/:categoryId', async (req, res) => {
            try {
                const categoryId = req.params.categoryId;
                const categories = await Category.findById(categoryId);
                res.status(200).json(categories);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Get all categories
        app.get('/get-all-categories', async (req, res) => {
            try {
                const branchId = req?.query?.branchId;
                let categories = null
                if (branchId) {
                    categories = await Category.find({ branchId: branchId });
                } else {
                    categories = await Category.find({});
                }

                res.status(200).json({ categories });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Get all categories
        app.get('/get-all-subcategories', async (req, res) => {
            try {
                const pId = req?.query?.id;
                console.log("pid", pId);
                let subcategories = null
                if (pId) {
                    subcategories = await SubCategory.find({ parentCategoryId: new ObjectId(pId) });
                } else {
                    subcategories = await SubCategory.find({});
                }

                res.status(200).json({ subcategories });
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
                            return res.status(200).json({ message: "User have been updated", response })
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
        app.get('/promo-code-details/:id', async (req, res) => {
            try {
                const id = req.params.id;

                // Check if branchId is provided
                // if (!branchId) {
                //     const users = await User.find();
                //     res.status(200).json({ users });
                //     return
                // }

                const promoCode = await PromoCode.findById(id);
                res.status(200).json({ promoCode });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Create Order here it is
        app.post('/create-order', async (req, res) => {
            console.log(req.body)
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
                    pros,
                    user_id
                });


                await order.save();

                const nodemailer = require("nodemailer");

                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false, // `true` for port 465, `false` for all other ports
                    auth: {
                        user: "yahyaammar4807@gmail.com",
                        pass: "pvoz ulzc qfyp rbmn",
                    },
                });

                // async..await is not allowed in global scope, must use a wrapper
                async function main() {
                    // send mail with defined transport object
                    const info = await transporter.sendMail({
                        from: '"New Order 👻" <yahyaamar4807@gmail.com>', // sender address
                        to: 'yahyaammar4807@gmail.com', // list of receivers
                        subject: "Congratulations! You got new Order ✔", // Subject line
                        text: `New order has been generated by user id ${order.id}`, // plain text body
                        html: `New order has been generated by user id ${order.id}`, // html body
                    });

                    console.log("Message sent: %s", info.messageId);
                    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
                }

                main().catch(console.error);

                res.status(201).json({ message: 'Order created successfully', order });
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
                const user = await User.findOne({ email: userEmail });
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                const startOfMonth = moment().startOf('month');
                const endOfMonth = moment().endOf('month');
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

        // get all promo codes where it belongs to products 
        app.get('/get-all-promocodes-of-products', async (req, res) => {
            try {
                // Step 1: Fetch all products
                const products = await Product.find();

                // Step 2: Extract promo codes from products
                const promoCodeIds = products.map(product => product.promoCode);

                // Step 3: Fetch promo codes using promoCodeIds
                const promoCodes = await PromoCode.find({ _id: { $in: promoCodeIds } });

                res.status(200).json({ message: 'All promoCodes of all products are', promoCodes });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });

        // Endpoint for deleting a section
        app.delete('/delete-section/:id', async (req, res) => {
            try {
                // Extract section ID from the request parameters
                const sectionId = req.params.id;

                // Find and delete the section by ID
                const deletedSection = await Section.findByIdAndDelete(sectionId);

                if (!deletedSection) {
                    return res.status(404).json({ message: 'Section not found' });
                }

                res.json({ message: 'Section deleted successfully', section: deletedSection });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });

        app.post('/create-section', async (req, res) => {
            try {
                // Extract data from the request body
                const { name, percentage, productIds } = req.body;


                // Create a new section
                const newSection = new Section({
                    name,
                    percentage,
                    products: productIds // Assuming productIds is an array of product IDs
                });

                // Save the section to the database

                await newSection.save();

                const nodemailer = require("nodemailer");

                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false, // `true` for port 465, `false` for all other ports
                    auth: {
                        user: "yahyaammar4807@gmail.com",
                        pass: "pvoz ulzc qfyp rbmn",
                    },
                });


                const users = await User.find();

                // Extract emails from the user documents
                let emails = users.map(({ email }) => email);
                emails = new Set(emails)
                const emailArray = Array.from(emails);
                // async..await is not allowed in global scope, must use a wrapper
                async function main() {
                    // send mail with defined transport object
                    const info = await transporter.sendMail({
                        from: '"Maddison Foo Koch 👻" <yahyaamar4807@gmail.com>', // sender address
                        to: emailArray.join(', '), // join the array with commas to create a comma-separated list of email addresses
                        subject: "Sale ✔", // Subject line
                        text: "New Sale on Our Website please visit to find out", // plain text body
                        html: "New Sale on Our Website please visit to find out", // html body
                    });

                    console.log("Message sent: %s", info.messageId);
                    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
                }

                main().catch(console.error);

                res.status(201).json({ message: 'Section created successfully', section: newSection });
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
