//I was following a playlist so this was just a part of that. I understand that this route2 is not a part
//of the current assignment

const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Orders were fetched'
    });
});

router.post('/', (req, res, next) => {
    const order={
        productId: req.body.productId,
        quantity: req.body.quantity
    };

    res.status(201).json({
        message: 'Order was created',
        order:order
    });
});

router.get('/:orderID', (req, res, next) => {
    res.status(200).json({
        message: 'Order details',
        orderID: req.params.orderID

    });
});

router.delete('/:orderID', (req, res, next) => {
    res.status(200).json({
        message: 'Order deleted',
        orderID: req.params.orderID

    });
});





module.exports = router;