- Create custom type
CREATE TYPE account_role AS ENUM ('Client', 'Admin');

-- Drop tables if they exist
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS classification CASCADE;
DROP TABLE IF EXISTS account CASCADE;

-- Create tables
CREATE TABLE account (...);
CREATE TABLE classification (...);
CREATE TABLE inventory (...);

-- Insert classification data
INSERT INTO classification (classification_name)
VALUES ('Sport'), ('SUV'), ('Truck');

-- Insert inventory data
INSERT INTO inventory (...);

-- Copy of Task 1, Query #4
UPDATE inventory
   SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
 WHERE inv_make = 'GM'
   AND inv_model = 'Hummer';

-- Copy of Task 1, Query #6
UPDATE inventory
   SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
       inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');