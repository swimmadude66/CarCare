CREATE DATABASE IF NOT EXISTS `carcare` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;

USE `carcare`;

CREATE TABLE IF NOT EXISTS `users` (
  `UserId` int(11) NOT NULL AUTO_INCREMENT,
  `Email` varchar(128) NOT NULL,
  `PassHash` varchar(128) NOT NULL,
  `Salt` varchar(64) NOT NULL,
  `Confirm` varchar(64) DEFAULT NULL,
  `Active` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`UserId`),
  UNIQUE KEY `UserId_UNIQUE` (`UserId`),
  UNIQUE KEY `Email_UNIQUE` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `sessions` (
  `SessionId` int(11) NOT NULL AUTO_INCREMENT,
  `SessionKey` varchar(32) NOT NULL,
  `UserId` int(11) NOT NULL,
  `Expires` bigint(20) NOT NULL,
  `Active` tinyint(1) NOT NULL DEFAULT '1',
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `LastUsed` bigint(20) NOT NULL,
  `UserAgent` text,
  PRIMARY KEY (`SessionId`),
  UNIQUE KEY `SessionId_UNIQUE` (`SessionId`),
  UNIQUE KEY `SessionKey_UNIQUE` (`SessionKey`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS `cars` (
  `CarId` int(11) NOT NULL AUTO_INCREMENT,
  `Make` varchar(32) NOT NULL,
  `Model` varchar(32) NOT NULL,
  `Trim` varchar(32) DEFAULT NULL,
  `Color` varchar(32) NOT NULL,
  `Owner` int(11) NOT NULL,
  `CarName` varchar(64) DEFAULT NULL,
  `License` varchar(32) DEFAULT NULL,
  `VIN` varchar(64) DEFAULT NULL,
  `PurchaseDate` date DEFAULT NULL,
  `CarPhoto` text,
  PRIMARY KEY (`CarId`),
  UNIQUE KEY `CarId_UNIQUE` (`CarId`),
  KEY `Owner_idx` (`Owner`),
  CONSTRAINT `Owner` FOREIGN KEY (`Owner`) REFERENCES `users` (`UserId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `car_metadata` (
  `MetadataId` int(11) NOT NULL AUTO_INCREMENT,
  `CarId` int(11) NOT NULL,
  `Key` varchar(64) NOT NULL,
  `Value` text NOT NULL,
  PRIMARY KEY (`MetadataId`),
  UNIQUE KEY `MetadataId_UNIQUE` (`MetadataId`),
  UNIQUE KEY `NoDupeKey` (`Key`,`CarId`),
  KEY `Car_idx` (`CarId`),
  CONSTRAINT `Car` FOREIGN KEY (`CarId`) REFERENCES `cars` (`CarId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
