-- wipe everything so this is rerunnable
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.classification CASCADE;
DROP TABLE IF EXISTS public.account CASCADE;
DROP TYPE  IF EXISTS public.account_type;

-- enum for account_type
CREATE TYPE public.account_type AS ENUM ('Client','Employee','Admin');

-- tables
CREATE TABLE public.account (
  account_id        SERIAL PRIMARY KEY,
  account_firstname VARCHAR(50)  NOT NULL,
  account_lastname  VARCHAR(50)  NOT NULL,
  account_email     VARCHAR(100) NOT NULL UNIQUE,
  account_password  VARCHAR(200) NOT NULL,
  account_type      public.account_type NOT NULL DEFAULT 'Client'
);

CREATE TABLE public.classification (
  classification_id   SERIAL PRIMARY KEY,
  classification_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE public.inventory (
  inv_id            SERIAL PRIMARY KEY,
  inv_make          VARCHAR(50)  NOT NULL,
  inv_model         VARCHAR(50)  NOT NULL,
  inv_description   TEXT         NOT NULL,
  inv_image         VARCHAR(200) NOT NULL,
  inv_thumbnail     VARCHAR(200) NOT NULL,
  classification_id INT          NOT NULL REFERENCES public.classification(classification_id)
);

-- seed classification (IDs will be: 1=Sport, 2=SUV, 3=Truck)
INSERT INTO public.classification (classification_name) VALUES ('Sport'),('SUV'),('Truck');

-- inventory rows (use known ids: Sport=1, SUV=2)
INSERT INTO public.inventory (inv_make,inv_model,inv_description,inv_image,inv_thumbnail,classification_id)
VALUES ('GM','Hummer','Rugged vehicle with small interiors','/images/gm-hummer.jpg','/images/gm-hummer-tn.jpg', 2);

INSERT INTO public.inventory (inv_make,inv_model,inv_description,inv_image,inv_thumbnail,classification_id)
VALUES ('Porsche','911','Iconic sports car','/images/porsche-911.jpg','/images/porsche-911-tn.jpg', 1);

INSERT INTO public.inventory (inv_make,inv_model,inv_description,inv_image,inv_thumbnail,classification_id)
VALUES ('Mazda','MX-5','Light, nimble roadster','/images/mazda-mx5.jpg','/images/mazda-mx5-tn.jpg', 1);

-- copy of Task 1 - Query #4 (update Hummer description)
UPDATE public.inventory
SET inv_description = REPLACE(inv_description,'small interiors','a huge interior')
WHERE inv_make='GM' AND inv_model='Hummer';

-- copy of Task 1 - Query #6 (ensure /vehicles/ in image paths)
UPDATE public.inventory
SET inv_image = CASE WHEN POSITION('/images/vehicles/' IN inv_image)=0
                     THEN REPLACE(inv_image,'/images/','/images/vehicles/')
                     ELSE inv_image END,
    inv_thumbnail = CASE WHEN POSITION('/images/vehicles/' IN inv_thumbnail)=0
                         THEN REPLACE(inv_thumbnail,'/images/','/images/vehicles/')
                         ELSE inv_thumbnail END;
