module.exports = (srv) => {
    const {Books} = cds.entities ('my.bookshop');

    //  reduce stock of ordered books
    srv.before("CREATE", "Orders", async (req) => {
        const order = req.data;
        if (!order.amount || order.amount <= 0) return req.error(400, "Order at least 1 book");

        const tx = cds.transaction(req);
        const affectedRows = await tx.run(Update(Books).set({
            stock: { '-=': order.amount }
        }).where({
            stock: { '>=': order.amount }, /*and*/ ID: order.book_ID
        }));

        if (affectedRows === 0) return req.error(409, "Sold out, Sorry");
    });
    // add some discount for overstocked books
    srv.after("READ", "Books", each => {
        if (each.stock > 111) each.title += " -- 11% discount!";
    });
};