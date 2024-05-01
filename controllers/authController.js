const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const dotenv = require('dotenv');
dotenv.config();


const loginUser2 = async (email, password) => {
  
    // setLoading2(true);
    const apiUrl = 'https://chatapp-backend-tm8i.onrender.com/api/user/login';
    const userData = {
      email: email,
      password: password
    };
  
   
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
  
      const data = await response.json();
     
    


  
     
      console.log("data",data);
      return data;

     
    
     
  
  };

  const createUser = async (name, email, password) => {

    console.log("name",name);
    console.log("email",email);
    console.log("password",password);

    const apiUrl = 'https://chatapp-backend-tm8i.onrender.com/api/user/createuser';
    // setLoading2(true);
  
    const userData = {
      name,
      email,
      password
    };
  
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
     
     console.log("response",response);
  
      const data = await response.json();
      console.log("data",data);
      return data;
    } catch (error) {
      // Handle network errors or other issues
      console.error('Error during user creation:', error);
    }
  };

  exports.registerTeacher = async (req, res) => {
    try {
        const { name, email, password, childEmail } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Please Enter all the Fields" });
        }

        let child = null;
        if (childEmail) {
            child = await Student.findOne({ email: childEmail.toLowerCase() });
            if (!child) {
                return res.status(404).json({ error: "No student found with the provided email" });
            }
        }

        const teacher = new Teacher({
            name,
            email,
            password,
            child: child ? child._id : undefined
        });

        

        const token = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET);

        // Assuming `createUser` is another service to handle some registration logic
        const signupData = await createUser(name, email, password);
        console.log("S",signupData);
        if (signupData.success) {
            await teacher.save();
            res.json({ token, signupData });
        } else if (signupData.error) {
            res.status(401).json({ error: signupData.error });
        } else {
            res.status(401).json({ error: "Something Went Wrong" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.registerStudent = async (req, res) => {
    try {
        const { name, email, password,semester,section,rollno,branch } = req.body;

        if (!name || !email || !password||!semester||!rollno||!branch||!section) {
            return res.status(400).json({ error: "Please Enter all the Fields" });
        }

        const student = new Student({ name, email, password,semester,section,rollno,branch});
        

        console.log(student._id);
        // Generate a token and send it in the response
        const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET);

        // res.json({ token });

        const signupData =await createUser(name,email,password);
        // console.log(signupdata)
        if(signupData.success){
            await student.save();
            res.json({ token,signupData});
           
        }
        else if(signupData.error){
            res.status(401).json({ error:signupData.error});
        }
        else{
            res.status(401).json({ error: "Something Went Wrong" });

        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.loginTeacher = async (req, res) => {
    try {
        const { email, password } = req.body;
        const teacher = await Teacher.findOne({ email }).select('+password');

        if (teacher && (await teacher.comparePassword(password))) {
            var token = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET);
         
        } else {
            res.status(401).json({ error: "Invalid Email or Password" });
        }
        const logindata =await loginUser2(email,password);
        if(logindata.success){
            res.json({ token,logindata});
           
        }
        else{
            res.status(401).json({ error: "Invalid Email or Password" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;
        const student = await Student.findOne({ email }).select('+password');;

        if (student &&(await student.comparePassword(password))) {
            var token = jwt.sign({ id: student._id }, process.env.JWT_SECRET);
            // res.json({ token });
        } else{
            res.status(401).json({ error: "Invalid Email or Password" });
        }
        const logindata =await loginUser2(email,password);
        if(logindata.success){
            res.json({ token,logindata});
           
        }
        else{
            res.status(401).json({ error: "Invalid Email or Password" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.logoutTeacher = (req, res) => {
    res.json({ success: true, message: 'Teacher logged out successfully' });
};

exports.logoutStudent = (req, res) => {
    res.json({ success: true, message: 'Student logged out successfully' });
};