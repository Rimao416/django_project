const mongoose = require('mongoose');
const IPAddressSchema = new mongoose.Schema({
    source_ip: String,
    destination_ip: String,
});
const IPAddress = mongoose.model('IPAddress', IPAddressSchema);
module.exports = IPAddress;
