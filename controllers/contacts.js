const Contact = require("../models/contacts");

const { HttpError, ctrlWrapper } = require("../helpers");
const { updateStatusContactSchema } = require("../schemas/contacts");

const listContacts = async (req, res) => {
  const result = await Contact.listContacts();
  res.json(result);
};

const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const result = await Contact.getContactById(contactId);
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
};

const addContact = async (req, res) => {
  const result = await Contact.addContact(req.body);
  res.status(201).json(result);
};

const removeContact = async (req, res) => {
  const { contactId } = req.params;
  const result = await Contact.removeContact(contactId);
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json({ message: "Contact deleted" });
};
const updateContact = async (req, res) => {
  const { contactId } = req.params;
  const result = await Contact.updateContact(contactId, req.body);
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
};
const updateStatusContact = async (req, res, next) => {
  const { error } = updateStatusContactSchema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const { contactId } = req.params;
  const result = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });
  if (!result) {
    throw HttpError(404, "Contact not found");
  }
  res.json(result);
};

module.exports = {
  listContacts: ctrlWrapper(listContacts),
  getContactById: ctrlWrapper(getContactById),
  removeContact: ctrlWrapper(removeContact),
  addContact: ctrlWrapper(addContact),
  updateContact: ctrlWrapper(updateContact),
  updateStatusContact: ctrlWrapper(updateStatusContact),
};
