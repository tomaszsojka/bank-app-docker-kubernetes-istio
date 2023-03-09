CREATE DATABASE bankapp;
USE bankapp;

CREATE TABLE `cards` (
  `card_id` INT NOT NULL AUTO_INCREMENT,
  `card_number` varchar(255),
  `card_pin` INT NOT NULL,
  `card_money` varchar(255),
  PRIMARY KEY (`card_id`)
);

INSERT INTO cards (card_number, card_pin, card_money) VALUES ('1234123412341234', 1234, '1000');
INSERT INTO cards (card_number, card_pin, card_money) VALUES ('2345234523452345', 2345, '20');
INSERT INTO cards (card_number, card_pin, card_money) VALUES ('3456345634563456', 3456, '5000');
INSERT INTO cards (card_number, card_pin, card_money) VALUES ('4567456745674567', 4567, '300');
INSERT INTO cards (card_number, card_pin, card_money) VALUES ('5678567856785678', 5678, '50');
INSERT INTO cards (card_number, card_pin, card_money) VALUES ('6789678967896789', 6789, '2');


