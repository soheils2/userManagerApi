import nodemailer from "nodemailer";

export function sendVerficationEmail(to: string, code: string) {
  console.log("activation Url is", code);
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
  // transporter.verify().then(console.log).catch(console.error);
  transporter
    .sendMail({
      from: "Manager App", // sender address
      to: to, // list of receivers
      subject: "Verfication Code ✔", // Subject line
      text: "به شرکت ما خوش آمدید کد فعال ساز پروفایل شما: " + code, // plain text body
      html:
        "<b>به شرکت ما خوش آمدید فعال ساز پروفایل شما: <br>" + code + "</b>", // html body
    })
    .then((info: any) => {
      //   console.log({ info });
    })
    .catch(console.error);
}

// sendVerficationEmail("soheilasami@gmail.com", "12345678");
