require('dotenv').config();
const Pinecone = require('../config/pineconeDB');
const OpenAI = require('../config/openAI');
const Vendor = require('../models/vendor.model');
const Supplier = require('../models/supplier.model');


const updateVendors = async(req, res) => {

//example vector being saved to pinecone
/*
    {
        id: '66e0a3100000000000000000',
        values: [0.001, 0.002, 0.003],
        metadata: { 
        businessName: 'Vendor 1', 
        department: 'Department 1', 
        serviceArea: 'Service Area 1',
        services: ['Service 1', 'Service 2']
        }
    }
*/

    let vendorVectors = [];
    const index = Pinecone.Index(process.env.YCC_VENDOR_PROFILES_INDEX_NAME);
    const vendors = await Vendor.find({}).populate('services');

    for (const vendor of vendors) {
    const response = await OpenAI.embeddings.create({
        model: "text-embedding-3-small",
        input: `${vendor.businessName} ${vendor.services.join(" ")}`
      });

      const vector = response.data[0].embedding;
      
      vendorVectors.push({
        id: vendor._id,
        values: vector,
        metadata: {
            businessName: vendor.businessName,
            department: vendor.department,
            serviceArea: vendor.serviceArea,
            services: vendor.services.map(service => service.name)
        }
      });
    }

    await index.upsert(vendorVectors);
    console.log('successfully uploaded to pinecone');

};

const updateSuppliers = async() => {
    const index = Pinecone.Index(process.env.YCC_SUPPLIER_PROFILES_INDEX_NAME);
    const suppliers = await Supplier.find({});
    console.log(suppliers);
    //await index.upsert(suppliers);
};

const updateCustomerServiceDataRepository = async() => {    
    const index = Pinecone.Index(process.env.BASIC_CHAT_BOT_INDEX_NAME);
   // console.log(customerServiceDataRepository);
    //await index.upsert(customerServiceDataRepository);
};

module.exports = { updateVendors, updateSuppliers, updateCustomerServiceDataRepository };