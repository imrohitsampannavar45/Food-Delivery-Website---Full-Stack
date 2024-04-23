// import { response } from 'express'
// import orderModel from '../models/orderModel.js'
// import userModel from '../models/userModel.js'
// import Stripe from "stripe"

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// const placeOrder = async (req,res) => {
//     const frontend_url = "http://localhost:5173"
// try {
//     const newOrder = new orderModel({
//         userId:req.body.userId,
//         items:req.body.items,
//         amount:req.body.amount,
//         address:req.body.address
//     })
//     await newOrder.save();
//     await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}});

//     const line_items = req.body.items.map((item)=>({
//         price_data:{
//             currency:"inr",
//             product_data:{
//                 name:item.name
//             },
//             unit_amount:item.price*100*80
//         },
//         quantity:item.quantity
//     }))

//     line_items.push({
//         price_data:{
//             currency:"inr",
//             product_data:{
//                 name:"Delivery Charges"
//         },
//         unit_amount:2*100
//     },
//     quantity:1
// })

// const session = await stripe.checkout.sessions.create({
//     line_items:line_items,
//     mode:'payment',
//     success_url:`${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
//     cancel_url:`${frontend_url}/verify?success=false&orderId=${newOrder._id}`
// })
//         response.json({success:true,session_url:session.url})
// } catch (error) {
//     console.log(error);
//     res.json({success:false,message:"Error"})
// }


// }

// export {placeOrder}




import { response } from 'express'; // Change this line to import { response } from 'express';
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import Stripe from 'stripe'; // Correct import statement

const stripe = new Stripe('sk_test_51P8KvgSHkDUef7couTFIArK7qVwAWg1rRTzguC0BiO0wToc1jM4hIu1S8NqIgzty0e6vbHjBhIdHvm7bBPUJ01uu00aA3SnwAl', {
  apiVersion: '2020-08-27', // Ensure you have the latest API version
});

const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173";
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name
        },
        unit_amount: item.price * 100 * 80
      },
      quantity: item.quantity
    }));

    line_items.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: "Delivery Charges"
        },
        unit_amount: 2 * 100
      },
      quantity: 1
    });

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: 'payment',
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`
    });
    res.json({ success: true, session_url: session.url }); // Change response.json to res.json
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
}

const verifyOrder = async(req,res)=> {
    const {orderId,success} = req.body;
    try {
      if (success==true){
        await orderModel.findByIdAndUpdate(orderId,{payment:true});
        res.join({success:true,message:"Paid"})
      }else{
        await orderModel.findByIdAndDelete(orderId);
        res.json({success:false,message:"Not Paid"})
      }
    } catch (error) {
      console.log(error);
      res.json({success:false,message:"ERROR"})
    }
  }


  //user order for frontend

  const userOrders = async (req,res) => {
try {
  const orders= await orderModel.find({userId:req.body.userId})
  res.json({success:true,data:orders})
} catch (error) {
  console.log(error);
  res.json({suceess:false,message:"error"})
}
  }
  

export {placeOrder,verifyOrder,userOrders};
