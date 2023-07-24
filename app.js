const { name } = require('ejs');
const express = require('express');
const mongoose = require('mongoose');
const _=require('lodash');
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.static('./public'));
var workList = [];

app.set('view engine', 'ejs')

async function start() {
    mongoose.connect("mongodb+srv://dhyanraibm:y1xXjDo8V6rlB2r7@cluster0.8a11ypf.mongodb.net/todolist", { useNewUrlParser: true })
        .then(() => {
            console.log('connected to DB');
        }).catch(() => {
            console.log("DB not connected");
        })
    const listSchema = new mongoose.Schema({ name: String });
    const Task = mongoose.model("Task", listSchema);

    const customListSchema = new mongoose.Schema({
        name: String,
        items: [listSchema]
    })
    const List = mongoose.model('List', customListSchema);

    const shop = new Task({ name: "Go to shopping" });
    const eat = new Task({ name: "Have your lunch" });
    const game = new Task({ name: "Play games" });
    var newItems = await Task.find();
    if (newItems.length === 0) {
        await Task.insertMany([shop, eat, game]);
        newItems = await Task.find();
    }




    app.get('/', (req, res) => {
        (async () => {
            newItems = await Task.find();
            res.render('list', { day: "Today", newItems: newItems });

        })();
    })

    app.post('/', (req, res) => {
        (async () => {
            if (req.body.button === "Today") {
                console.log(req.body);
                const task = new Task({ name: req.body.task });
                task.save();
                res.redirect('/');
            }
            else {
                const task = new Task({ name: req.body.task });
                const fetchDoc = await List.findOne({ name: req.body.button });
                fetchDoc.items.push(task);
                await fetchDoc.save();
                res.redirect('/' + req.body.button)
            }
        })();
    })

    app.get('/:id', (req, res) => {
        (async () => {
            const customList =_.capitalize(req.params.id);
            const list = await List.findOne({ name: customList });
            if (!list) {
                const customItem = new List({
                    name: customList,
                    items: [shop, eat, game]
                })
                await customItem.save();
                res.redirect('/' + customList);
            }
            else {
                res.render('list', { day: list.name, newItems: list.items });
            }

        })();

    })
    app.get('/about', (req, res) => {
        res.render('about')
    })

    app.post('/delete', (req, res) => {
        (async () => {
            const deleteItem = req.body.checkbox;
            if (req.body.deletePath == "Today") {
                await Task.deleteOne({ _id: deleteItem });
                res.redirect('/');
            }
            else{
                await List.findOneAndUpdate({name:req.body.deletePath},{$pull:{items:{_id:deleteItem}}});
                res.redirect('/'+req.body.deletePath)
            }

        })();
    })

    app.listen(3000, () => {
        console.log('The server has started on port 3000:');
    })
}
start();