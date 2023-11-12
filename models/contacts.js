const { Schema, model } = require("mongoose");

const schemaContacts = Schema({
  name: {
    type: String,
    required: [true, "Set name for contact"],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
});
const Contact = model("contact", schemaContacts);

module.exports = Contact;

// const fs = require("fs/promises");
// const path = require("path");
// const { nanoid } = require("nanoid");

// const contactsPath = path.join(__dirname, "contacts.json");

// const listContacts = async () => {
//   const data = await fs.readFile(contactsPath, "utf-8");
//   return JSON.parse(data);
// };

// const getContactById = async (contactId) => {
//   const contacts = await listContacts();
//   const result = contacts.find((item) => item.id === contactId);
//   return result || null;
// };

// const removeContact = async (contactId) => {
//   const contacts = await listContacts();
//   const index = contacts.findIndex((item) => item.id === contactId);
//   if (index === -1) {
//     return null;
//   }
//   const [result] = contacts.splice(index, 1);
//   await fs.writeFile(contactsPath, JSON.stringify(contacts, undefined, 2));
//   return result;
// };

// const addContact = async (body) => {
//   const contacts = await listContacts();
//   const newContact = {
//     id: nanoid(),
//     ...body,
//   };
//   contacts.push(newContact);
//   await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
//   return newContact;
// };

// const updateContact = async (contactId, body) => {
//   const contacts = await listContacts();
//   const contactIndex = contacts.findIndex((item) => item.id === contactId);
//   if (contactIndex === -1) {
//     return null;
//   }
//   contacts[contactIndex] = { id: contactId, ...body };
//   await fs.writeFile(contactsPath, JSON.stringify(contacts, undefined, 2));
//   return contacts[contactIndex];
// };

// module.exports = {
//   listContacts,
//   getContactById,
//   removeContact,
//   addContact,
//   updateContact,
// };
