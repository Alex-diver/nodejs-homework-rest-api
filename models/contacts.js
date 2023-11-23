const mongoose = require("mongoose");

const handleMongooseError = require("../helpers/handleMongooseError");

const schemaContacts = new mongoose.Schema({
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
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});

schemaContacts.post("save", handleMongooseError);

const Contact = mongoose.model("contacts", schemaContacts);

module.exports = Contact;
