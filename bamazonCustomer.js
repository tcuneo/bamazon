var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
})

function userPurchase() {
        inquirer
            .prompt([
            {
                name: "item_id",
                type: "input",
                message: "Which product ID would you like to buy?"
            },
            {
                name: "quantity",
                type: "input",
                message: "How many units would you like to buy?"
            }
            ])
            .then(function(answer) {
                var item = answer.item_id;
                var quantity = answer.quantity;
                var queryStr = "SELECT * FROM products WHERE ?";

                connection.query(queryStr, {item_id: item}, function(err, res) {
                    if (err) throw err;

                    if (res.length ===0) {
                        console.log("ERROR: No item ID exists. Please use a valid ID");
                        displayTable();
                    } else {
                        var productInfo = res[0];

                        if (quantity <= productInfo.stock_quantity) {
                            console.log("Item is in stock, placing order now");
                            var updateTableStr = "UPDATE products SET stock_quantity = " + (productInfo.stock_quantity - quantity) + " WHERE item_id = " + item;

                            connection.query(updateTableStr, function(err, res) {
                                if (err) throw err;

                                console.log("Order has been placed. Your total is $" + productInfo.price * quantity);
                                console.log("Come again!");
                                console.log("\n-----------------------------------------------------------------\n");

                                connection.end();
                            })
                        } else {
                            console.log("Sorry, there is not enough items in stock");
                            console.log("Please modify the quantity or select another item");
                            console.log("\n-----------------------------------------------------------\n");

                            displayTable();
                        }
                    }

            });
    
        });
    };

    function displayTable() {
        var queryStr = "SELECT * FROM products";

        connection.query(queryStr, function(err, res) {
            if (err) throw err;
            console.log("Current Inventory: ");
            console.log("---------------------------\n");
        

        for (var i = 0; i < res.length; i++) {
            console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].price + " | " + res[i].stock_quantity);
          }
          console.log("-----------------------------------");
          userPurchase();
        });
    };

    displayTable();
