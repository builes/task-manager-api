//https://sendgrid.com/
//npm i @sendgrid/mail

//Segunda autenticacion que debemos de hacer
// https://app.sendgrid.com/settings/sender_auth/senders

//https://app.sendgrid.com/guide/integrate/langs/nodejs

const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//Asi enviamos un correo
// sgMail.send({
//   to: "rmbuilesm@unal.edu.co",
//   from: "builes@utp.edu.co",
//   subject: "Testing sendgrid",
//   text: "I'll work in United Kingdom this year :)",
// });

//Funcion que se encarga de enviar un email a un usaurio cuando crea la cuenta
const sendWelcomeEmail = ({ email, name }) => {
  sgMail.send({
    to: email,
    from: "builes@utp.edu.co",
    subject: "Thanks for joining in!",
    text: `Welcome to the app ${name}`,
  });
};

function deletedAccount({ email, name }) {
  sgMail.send({
    to: email,
    from: "builes@utp.edu.co",
    subject: "Bye",
    text: `Goodbye ${name}, is there anything we could have done for you?`,
  });
}

module.exports = {
  sendWelcomeEmail,
  deletedAccount,
};
