const express = require('express');
const app = express();
const cron = require('node-cron');

app.use(express.json());


const menu = [
    { id: 1, name: "Butter chicken", price: 300, category: "Main Course" },
    { id: 2, name: "Prawns fry", price: 250, category: "Appetizer" },
    { id: 3, name: "Ice Cream", price: 50, category: "Dessert" },
    { id: 4, name: "Gulab Jamun", price: 70, category: "Dessert" },
    { id: 5, name: "Naan", price: 120, category: "Main Course" },
];

const orders = [];


app.get('/menu', (req, res) => {
    res.json(menu);
});


app.post('/menu', (req, res) => {
    const { id, name, price, category } = req.body;

    if (!name || price <= 0 || !['Appetizer', 'Main Course', 'Dessert'].includes(category)) {
        return res.status(400).json({ message: 'Invalid menu item data' });
    }

    const existingItem = menu.find(item => item.id === id);

    if (existingItem) {
        existingItem.name = name;
        existingItem.price = price;
        existingItem.category = category;
        res.json({ message: 'Menu item updated', item: existingItem });
    } else {
      
        const newItem = { id: menu.length + 1, name, price, category };
        menu.push(newItem);
        res.status(201).json({ message: 'Menu item added', item: newItem });
    }
});


app.post('/orders', (req, res) => {
    const { items } = req.body;

    if (!items || !items.every(id => menu.some(item => item.id === id))) {
        return res.status(400).json({ message: 'Invalid item IDs in order' });
    }

    const newOrder = {
        id: orders.length + 1,
        items,
        status: 'Preparing',
        createdAt: new Date(),
    };

    orders.push(newOrder);
    res.status(201).json({ message: 'Order placed', order: newOrder });
});


app.get('/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
});


cron.schedule('*/1 * * * *', () => {
    orders.forEach(order => {
        if (order.status === 'Preparing') {
            order.status = 'Out for Delivery';
        } else if (order.status === 'Out for Delivery') {
            order.status = 'Delivered';
        }
    });
    console.log('Order statuses updated.');
});


const hardcodedOrder1 = {
    id: orders.length + 1,
    items: [1], 
    status: 'Preparing',
    createdAt: new Date(),
};

const hardcodedOrder2 = {
    id: orders.length + 1,
    items: [4],
    status: 'Preparing',
    createdAt: new Date(),
};

orders.push(hardcodedOrder1);
orders.push(hardcodedOrder2);

console.log('Hardcoded Orders placed:', [hardcodedOrder1, hardcodedOrder2]);

// Default Route
app.get('/', (req, res) => {
    res.send('Welcome to the Food Delivery Backend API');
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
