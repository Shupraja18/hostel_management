const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User =
  require('../models/User');

const {
  authenticate
} = require('../middleware/auth');


const router =
  express.Router();


// ========================================
// CREATE JWT
// ========================================

function createToken(user) {

  return jwt.sign(

    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },

    process.env.JWT_SECRET,

    {
      expiresIn: '7d'
    }

  );
}


// ========================================
// STUDENT REGISTER
// ========================================

router.post(
  '/student/register',
  async (req, res) => {

    try {

      const {
        name,
        email,
        password,
        room,
        phone
      } = req.body;


      if (
        !name ||
        !email ||
        !password ||
        !room
      ) {

        return res.status(400).json({
          message:
            'Please fill all required fields.'
        });

      }


      if (password.length < 6) {

        return res.status(400).json({
          message:
            'Password must contain at least 6 characters.'
        });

      }


      const existingUser =
        await User.findOne({
          email:
            email.toLowerCase()
        });


      if (existingUser) {

        return res.status(409).json({
          message:
            'An account with this email already exists.'
        });

      }


      const hashedPassword =
        await bcrypt.hash(
          password,
          12
        );


      const user =
        await User.create({

          name,

          email:
            email.toLowerCase(),

          password:
            hashedPassword,

          role: 'student',

          room,

          phone
        });


      const token =
        createToken(user);


      res.status(201).json({

        message:
          'Student account created successfully.',

        token,

        user: {

          id: user._id,

          name: user.name,

          email: user.email,

          role: user.role,

          room: user.room,

          phone: user.phone

        }

      });

    } catch (error) {

      console.error(
        'Registration error:',
        error
      );

      res.status(500).json({
        message:
          'Registration failed.'
      });

    }

  }
);


// ========================================
// STUDENT LOGIN
// ========================================

router.post(
  '/student/login',
  async (req, res) => {

    try {

      const {
        email,
        password
      } = req.body;


      if (!email || !password) {

        return res.status(400).json({
          message:
            'Email and password are required.'
        });

      }


      const user =
        await User.findOne({

          email:
            email.toLowerCase(),

          role: 'student'

        });


      if (!user) {

        return res.status(401).json({
          message:
            'Invalid student credentials.'
        });

      }


      const passwordMatch =
        await bcrypt.compare(
          password,
          user.password
        );


      if (!passwordMatch) {

        return res.status(401).json({
          message:
            'Invalid student credentials.'
        });

      }


      const token =
        createToken(user);


      res.json({

        message:
          'Login successful.',

        token,

        user: {

          id: user._id,

          name: user.name,

          email: user.email,

          role: user.role,

          room: user.room,

          phone: user.phone

        }

      });

    } catch (error) {

      console.error(
        'Student login error:',
        error
      );

      res.status(500).json({
        message:
          'Login failed.'
      });

    }

  }
);


// ========================================
// WARDEN LOGIN
// ========================================

router.post(
  '/warden/login',
  async (req, res) => {

    try {

      const {
        email,
        password
      } = req.body;


      if (!email || !password) {

        return res.status(400).json({
          message:
            'Email and password are required.'
        });

      }


      const user =
        await User.findOne({

          email:
            email.toLowerCase(),

          role: 'warden'

        });


      if (!user) {

        return res.status(401).json({
          message:
            'Invalid warden credentials.'
        });

      }


      const passwordMatch =
        await bcrypt.compare(
          password,
          user.password
        );


      if (!passwordMatch) {

        return res.status(401).json({
          message:
            'Invalid warden credentials.'
        });

      }


      const token =
        createToken(user);


      res.json({

        message:
          'Login successful.',

        token,

        user: {

          id: user._id,

          name: user.name,

          email: user.email,

          role: user.role

        }

      });

    } catch (error) {

      console.error(
        'Warden login error:',
        error
      );

      res.status(500).json({
        message:
          'Login failed.'
      });

    }

  }
);


// ========================================
// CURRENT USER
// ========================================

router.get(
  '/me',
  authenticate,
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.user.id
        )
        .select('-password');


      if (!user) {

        return res.status(404).json({
          message:
            'User not found.'
        });

      }


      res.json(user);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          'Could not retrieve user.'
      });

    }

  }
);


module.exports = router;