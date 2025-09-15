-- Q1: Add Tony Stark (id + type will set themselves)
INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- Q2: Change Tony’s account_type to Admin
UPDATE account
   SET account_type = 'Admin'
 WHERE account_email = 'tony@starkent.com';

-- Q3: Delete Tony (clean him out)
DELETE FROM account
 WHERE account_email = 'tony@starkent.com';

-- Q4: Update GM Hummer description -> swap “small interiors” with “a huge interior”
UPDATE inventory
   SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
 WHERE inv_make = 'GM'
   AND inv_model = 'Hummer';

-- Q5: Inner join to see make, model + classification for Sport cars (should give 2 rows)
SELECT i.inv_make, i.inv_model, c.classification_name
  FROM inventory i
  JOIN classification c
    ON i.classification_id = c.classification_id
 WHERE c.classification_name = 'Sport';

-- Q6: Update all inventory images so they include /vehicles/ in the path
UPDATE inventory
   SET inv_image =
         CASE WHEN POSITION('/images/vehicles/' IN inv_image) = 0
              THEN REPLACE(inv_image, '/images/', '/images/vehicles/')
              ELSE inv_image END,
       inv_thumbnail =
         CASE WHEN POSITION('/images/vehicles/' IN inv_thumbnail) = 0
              THEN REPLACE(inv_thumbnail, '/images/', '/images/vehicles/')
              ELSE inv_thumbnail END;
