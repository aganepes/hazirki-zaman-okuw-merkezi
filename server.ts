import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import nodemailer from 'nodemailer';

const app = new Hono()

app.use('/static/*', serveStatic({ root: './' }))

app.get('/', serveStatic({ path: "static/index.html" }));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: Bun.env.EMAIL_USER,
    pass: Bun.env.EMAIL_PASS,
  },
});

app.post('/send-email', async (c) => {
  try {
    const {name,phone,message} = await c.req.json();
    if(!name || !phone || !message){
      return c.json({success:false,error:"Meýdanlary doldurmagyňyzy haýyş edýäris."},400);
    }
    const mailOptions = {
      from: `"Ýazylyşyl üçin ${name}-den email" <${Bun.env.EMAIL_USER}>`,
      to: "kemalamanov25@gmail.com",
      subject: "Ýazylyş üçin täze email",
      html: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px;  margin:0 auto; border:1px solid #e0e0e0;  border-radius: 10px; overflow: hidden;">
    <div style="background-color: #4a90e2; color:white;  padding:20px; text-align: center;">
      <h2>Täze bildiriş geldi !</h2>
    </div>
    <div style="padding:30px;background-color: #fff;">
      <div style="color:#333;  font-size: 16px; font-weight: bold; margin-bottom: 20px; padding-bottom: 10px; border-bottom:1px solid #f0f0f0;">Ady </div>
      <div style="color:#888; font-size: 12px; text-transform: uppercase;  margin-bottom: 5px;">Geldimyrat</div>
      <div style="color:#333;  font-size: 16px; font-weight: bold; margin-bottom: 20px; padding-bottom: 10px; border-bottom:1px solid #f0f0f0;">Telefon belgisi </div>
      <div style="color:#888; font-size: 12px; text-transform: uppercase;  margin-bottom: 5px;">+99360000000</div>
      <div style="color:#333;  font-size: 16px; font-weight: bold; margin-bottom: 20px; padding-bottom: 10px; border-bottom:1px solid #f0f0f0;">Haty </div>
      <div style="background-color: #f4f4f4;  padding:15px; border-radius: 5px; border-left: 4px solid #4a90e2; line-height: 1.6;">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae id nihil atque sint omnis suscipit totam natus unde quas accusamus! Aut corporis atque provident voluptatum eius magnam cum modi suscipit.
      </div>
    </div>
    <div style=" background-color: #f4f4f4;color:#999; padding:15px;text-align: center;font-size: 12px;">
      Bu e-mail websaýtyňyzdaky Habarlaşmak formasyndan awtomatik usulda ugradyldy.
    </div>
  </div>`,
    }
    await transporter.sendMail(mailOptions);
    return c.json({succecc:true,message:"E-mail ugradyldy."});
  } catch (error) {
    return c.json({success:false,error:"E-mail ugradylmady."});
  }
});


export default {
  fetch: app.fetch,
  port: Bun.env.PORT
}
