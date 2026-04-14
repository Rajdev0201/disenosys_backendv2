const express = require('express');
const router = express.Router();
const Code = require('../models/code.js');


router.post('/generate-code', async (req, res) => {
    const { college ,city,country} = req.body;
    const standardizedCollegeName = college.toLowerCase().trim();

    try {
        let existingCode = await Code.findOne({ college });

        if (existingCode) {
            return res.json({ 
                message: `A code already exists for ${existingCode.college}.`,
                code: existingCode 
            });
        }

   
        const code = Math.random().toString(36).substr(2, 8).toUpperCase();

        const newCode = new Code({
            college:standardizedCollegeName,
            city,
            country,
            code,
            userType: 'college', 
            expiresAt: null, 
        });

        await newCode.save();

        res.json({ 
            message: `A new code has been generated for ${college}.`,
            code: newCode 
        });
    } catch (error) {
        res.status(400).json({ error: 'Failed to generate code' });
    }
});

router.post('/generate-external-code', async (req, res) => {
    const { month, year } = req.body;
    if (month < 0 || month > 11 || year < 1900) {
        return res.status(400).json({ message: 'Invalid month or year provided.' });
    }

    const expirationDate = new Date(year, month + 1, 0, 23, 59, 59); 

    try {
        let existingCode = await Code.findOne({
            userType: 'external',
            expiresAt: {
                $gte: new Date(year, month, 1), // First day of the month
                $lte: expirationDate // Last day of the month
            }
        });
        if (existingCode) {
            return res.json({
                message: `A code already exists for ${month + 1}/${year}.`,
                code: existingCode
            });
        }

        const code = Math.random().toString(36).substr(2, 8).toUpperCase();

        const newCode = new Code({
            code,
            userType: 'external',
            expiresAt: expirationDate,
            college: null
        });

        await newCode.save();
        res.status(201).json({
            message: `A new code has been generated for ${month + 1}/${year}.`,
            code: newCode
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed generating code', error });
    }
});

router.post('/generate-company-code', async (req, res) => {
    const { cname,month, year } = req.body;
    if (month < 0 || month > 11 || year < 1900) {
        return res.status(400).json({ message: 'Invalid month or year provided.' });
    }

    const expirationDate = new Date(year, month + 1, 0, 23, 59, 59); 

    try {
        let existingCode = await Code.findOne({
            userType: 'companycode',
            expiresAt: {
                $gte: new Date(year, month, 1),
                $lte: expirationDate
            }
        });
        // if (existingCode) {
        //     return res.json({
        //         message: `A code already exists for ${month + 1}/${year}.`,
        //         code: existingCode
        //     });
        // }

        const code = Math.random().toString(36).substr(2, 8).toUpperCase();

        const newCode = new Code({
            code,
            cname,
            userType: 'companycode',
            expiresAt: expirationDate,
            college: null
        });

        await newCode.save();
        res.status(201).json({
            message: `A new code has been generated for ${month + 1}/${year}.`,
            code: newCode
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed generating code', error });
    }
});


router.get('/studentCode', async (req,res) => {

    try{
    const student = await Code.find({userType:"college"});

    if(!student){
          return res.status(400).json({ error: 'No Data is available' });
    }

    res.status(200).json({
        message: 'Student data is saved',
        data: student,
      });
    }catch(err){
        console.log(err);
        return res.status(500).json({err : "data is not fetched"})
    }
})

router.patch('/externalCode/:id', async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;
  
    try {
      const updatedCode = await Code.findByIdAndUpdate(
        id,
        { isActive },
        { new: true }
      );
  
      if (!updatedCode) {
        return res.status(400).json({ error: "Your exam not started yet,Please contact admin team!" });
      }
  
      res.status(200).json({ success: true, data: updatedCode });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Server error" });
    }
  });


router.delete('/studentCode/:id', async (req,res) => {
    const { id } = req.params;
    try{
    const student = await Code.find({userType:"college"});

    if(!student){
          return res.status(400).json({ error: 'No Data is available' });
    }

    const fixed = await Code.findByIdAndDelete(id);

    res.status(200).json({
        message: 'Student code has deleted',
        data: fixed,
      });
    }catch(err){
        console.log(err);
        return res.status(500).json({err : "data is not deleted"})
    }
})

router.get('/externalCode', async (req,res) => {
    
    try{
        const student = await Code.find({userType:"external"});
    
        if(!student){
              return res.status(400).json({ error: 'No Data is available' });
        }
   
        res.status(200).json({
            message: 'External code has created',
            data: student,
          });
        }catch(err){
            console.log(err);
            return res.status(500).json({err : "data is not created"})
        }
})

router.get('/companyCode', async (req,res) => {
    
    try{
        const student = await Code.find({userType:"companycode"});
    
        if(!student){
              return res.status(400).json({ error: 'No Data is available' });
        }
   
        res.status(200).json({
            message: ' companycode has created',
            data: student,
          });
        }catch(err){
            console.log(err);
            return res.status(500).json({err : "data is not created"})
        }
})


router.delete('/externalCode/:id', async (req,res) => {
    const { id } = req.params;
    try{
        const student = await Code.find({userType:"external"});
    
        if(!student){
              return res.status(400).json({ error: 'No Data is available' });
        }
        const fixed = await Code.findByIdAndDelete(id);
        res.status(200).json({
            message: 'External code has deleted',
            data: fixed,
          });
        }catch(err){
            console.log(err);
            return res.status(500).json({err : "data is not deleted"})
        }
})

router.delete('/compnyCode/:id', async (req,res) => {
    const { id } = req.params;
    try{
        const student = await Code.find({userType:"companycode"});
    
        if(!student){
              return res.status(400).json({ error: 'No Data is available' });
        }
        const fixed = await Code.findByIdAndDelete(id);
        res.status(200).json({
            message: 'External code has deleted',
            data: fixed,
          });
        }catch(err){
            console.log(err);
            return res.status(500).json({err : "data is not deleted"})
        }
})

module.exports = router;
