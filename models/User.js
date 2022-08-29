const { Model, DataTypes } = require('sequelize');

module.exports = ( sequelize ) => {

    class User extends Model {}

    User.init({
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "A first name is required"
                },
                notEmpty: {
                    msg: "Please provide a first name"
                }
            }
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "A last name is required"
                },
                notEmpty: {
                    msg: "Please provide a last name"
                }
            }
        },
        emailAddress: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                msg: "A user has already used this email address"
            },
            validate: {
                notNull: {
                    msg: "An email address is required"
                },
                notEmpty: {
                    msg: "Please provide an email address"
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "A password is required"
                },
                notEmpty: {
                    msg: "Please provide a password"
                }
            }
        },
        set(val) {
            const hashedPassword = bcrypt.hashSync(val, 10);
            this.setDataValue('password', hashedPassword);
        }
    }, { sequelize });

    User.association = (models) => {
        User.hasMany(models.Course, {
            as: 'courseCreator',
            foreignKey: {
                fieldName: 'userId',
                allowNull: false
            }
        });
    };

    return User;
};

