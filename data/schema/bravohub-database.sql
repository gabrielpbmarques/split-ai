-- MySQL dump 10.13  Distrib 9.6.0, for macos26.2 (arm64)
--
-- Host: bravo-database-01.cluster-cql6ncr5mvih.us-east-1.rds.amazonaws.com    Database: bravohub_application
-- ------------------------------------------------------
-- Server version	5.7.12

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `admin_config`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_config` (
  `conf_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `conf_key` varchar(255) DEFAULT '',
  `conf_value` varchar(255) DEFAULT '',
  `conf_type` varchar(255) DEFAULT '',
  PRIMARY KEY (`conf_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1402 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `admin_user`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_user` (
  `user_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_thumb` varchar(255) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `user_lastname` varchar(255) DEFAULT NULL,
  `user_document` varchar(255) DEFAULT NULL,
  `user_genre` int(11) DEFAULT NULL,
  `user_datebirth` date DEFAULT NULL,
  `user_telephone` varchar(255) DEFAULT NULL,
  `user_cell` varchar(255) DEFAULT NULL,
  `user_email` varchar(255) NOT NULL DEFAULT '',
  `user_password` varchar(255) NOT NULL DEFAULT '',
  `user_channel` varchar(255) DEFAULT NULL,
  `user_registration` timestamp NULL DEFAULT NULL,
  `user_lastupdate` timestamp NULL DEFAULT NULL,
  `user_lastaccess` timestamp NULL DEFAULT NULL,
  `user_login` varchar(255) DEFAULT NULL,
  `user_login_cookie` varchar(255) DEFAULT NULL,
  `user_level` int(11) NOT NULL DEFAULT '1',
  `user_facebook` varchar(255) DEFAULT NULL,
  `user_twitter` varchar(255) DEFAULT NULL,
  `user_youtube` varchar(255) DEFAULT NULL,
  `user_google` varchar(255) DEFAULT NULL,
  `user_blocking_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company` (
  `company_id` int(11) NOT NULL AUTO_INCREMENT,
  `company_slug` varchar(255) DEFAULT NULL,
  `company_status` int(11) DEFAULT NULL,
  `company_timezone` varchar(64) DEFAULT 'America/Sao_Paulo',
  `company_name` varchar(255) DEFAULT NULL,
  `company_fantasy` varchar(255) DEFAULT NULL,
  `company_document` varchar(255) DEFAULT NULL,
  `company_created` datetime DEFAULT NULL,
  `company_logo` varchar(255) DEFAULT NULL,
  `company_favicon` varchar(255) DEFAULT NULL,
  `company_custom_css` text,
  `company_s3_bucket` varchar(255) DEFAULT NULL,
  `company_sendgrid_email` varchar(255) DEFAULT NULL,
  `company_module_feed` int(11) DEFAULT '1',
  `company_module_campus` int(11) DEFAULT '1',
  `company_module_wiki` int(11) DEFAULT '1',
  `company_module_todo` int(11) DEFAULT '1',
  `company_module_channels` int(11) DEFAULT '1',
  `company_module_message` int(11) DEFAULT '1',
  `company_module_incentive` int(11) DEFAULT '1',
  `company_module_events` int(11) DEFAULT '0',
  `company_api_key` varchar(255) DEFAULT NULL,
  `company_campaign_enable` varchar(255) DEFAULT NULL,
  `company_suport_info` text CHARACTER SET utf8mb4,
  `company_domain` varchar(255) DEFAULT NULL,
  `company_whatsapp_status` int(11) DEFAULT NULL,
  `company_whatsapp_token` varchar(1000) DEFAULT NULL,
  `company_whatsapp_contract` varchar(1000) DEFAULT NULL,
  `company_module_gamification` int(1) DEFAULT NULL,
  `company_super_pass` varchar(25) DEFAULT NULL,
  `company_register_url` varchar(255) DEFAULT NULL,
  `company_module_galileu` int(11) DEFAULT '1',
  `company_complete_user_information` int(11) DEFAULT '0',
  `company_email_limit_month` int(11) DEFAULT '0',
  `company_caum_completed` varchar(255) DEFAULT NULL,
  `company_caum_nocompleted` varchar(255) DEFAULT NULL,
  `company_module_survey` int(11) DEFAULT '1',
  `company_weon_phone` varchar(255) DEFAULT NULL,
  `company_weon_message` varchar(255) DEFAULT NULL,
  `company_prize_tax` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_access_profile`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_access_profile` (
  `profile_id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) DEFAULT NULL,
  `profile_name` varchar(255) DEFAULT NULL,
  `profile_days` varchar(255) DEFAULT NULL,
  `profile_start` time DEFAULT NULL,
  `profile_end` time DEFAULT NULL,
  PRIMARY KEY (`profile_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_access_profile_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_analytics_event`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_analytics_event` (
  `event_id` varchar(36) NOT NULL,
  `event_type` varchar(128) DEFAULT NULL,
  `event_created` datetime DEFAULT NULL,
  `event_data` json DEFAULT NULL,
  `session_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  KEY `session_id` (`session_id`),
  CONSTRAINT `app_company_analytics_event_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `app_company_analytics_session` (`session_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_analytics_session`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_analytics_session` (
  `session_id` varchar(36) NOT NULL,
  `session_created` datetime DEFAULT NULL,
  `session_finish` datetime DEFAULT NULL,
  `session_ip` varchar(128) DEFAULT NULL,
  `session_ip_location_country` varchar(128) DEFAULT NULL,
  `session_ip_location_state` varchar(128) DEFAULT NULL,
  `session_ip_location_city` varchar(128) DEFAULT NULL,
  `session_device_agent` varchar(255) DEFAULT NULL,
  `session_device_type` varchar(128) DEFAULT NULL,
  `session_device_os` varchar(128) DEFAULT NULL,
  `session_device_browser` varchar(128) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `session_last_event` datetime DEFAULT NULL,
  PRIMARY KEY (`session_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_analytics_session_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_analytics_session_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign` (
  `campaign_id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign_uuid` varchar(255) DEFAULT NULL,
  `campaign_type` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_tickets` int(11) DEFAULT NULL,
  `campaign_tickets_start` int(11) DEFAULT NULL,
  `campaign_name` varchar(255) DEFAULT NULL,
  `campaign_terms` longtext,
  `campaign_terms_mini` text,
  `campaign_created` datetime DEFAULT NULL,
  `campaign_start` datetime DEFAULT NULL,
  `campaign_end` datetime DEFAULT NULL,
  `campaign_register` int(11) DEFAULT NULL,
  `campaign_status` int(11) DEFAULT NULL,
  `campaign_global` int(11) NOT NULL DEFAULT '1',
  `campaign_cover` varchar(255) DEFAULT NULL,
  `campaign_api_path` varchar(255) DEFAULT NULL,
  `campaign_api_token` varchar(255) DEFAULT NULL,
  `campaign_galileu` int(11) DEFAULT '0',
  `campaign_archived` int(11) DEFAULT '0',
  PRIMARY KEY (`campaign_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_campaign_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=149 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_admin`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_admin` (
  `admin_id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`admin_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_campaign_admin_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_admin_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_admin_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=421 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_affiliate_events`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_affiliate_events` (
  `event_id` varchar(36) NOT NULL,
  `event_session_id` varchar(255) DEFAULT NULL,
  `event_term` varchar(255) DEFAULT NULL,
  `event_content` varchar(255) DEFAULT NULL,
  `event_type` varchar(255) DEFAULT NULL,
  `event_custom_data` json DEFAULT NULL,
  `event_created` datetime DEFAULT NULL,
  `affiliate_id` varchar(36) DEFAULT NULL,
  `seller_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  KEY `affiliate_id` (`affiliate_id`),
  KEY `seller_id` (`seller_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_campaign_affiliate_events_ibfk_1` FOREIGN KEY (`affiliate_id`) REFERENCES `app_company_campaign_affiliates` (`affiliate_id`),
  CONSTRAINT `app_company_campaign_affiliate_events_ibfk_2` FOREIGN KEY (`seller_id`) REFERENCES `app_company_campaign_affiliate_sellers` (`seller_id`),
  CONSTRAINT `app_company_campaign_affiliate_events_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_affiliate_events_ibfk_4` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_affiliate_events_ibfk_5` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_affiliate_link_alias`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_affiliate_link_alias` (
  `alias_id` varchar(36) NOT NULL,
  `alias_link` varchar(255) DEFAULT NULL,
  `link_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `alias_code` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`alias_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  KEY `link_id` (`link_id`),
  CONSTRAINT `app_company_campaign_affiliate_link_alias_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_affiliate_link_alias_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_affiliate_link_alias_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `app_company_campaign_affiliate_link_alias_ibfk_5` FOREIGN KEY (`link_id`) REFERENCES `app_company_campaign_affiliate_links` (`link_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_affiliate_links`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_affiliate_links` (
  `link_id` varchar(36) NOT NULL,
  `link_name` varchar(255) DEFAULT NULL,
  `link_code` varchar(36) DEFAULT NULL,
  `link_param_term` varchar(255) DEFAULT NULL,
  `link_param_content` varchar(255) DEFAULT NULL,
  `program_id` varchar(36) DEFAULT NULL,
  `seller_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`link_id`),
  KEY `seller_id` (`seller_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  KEY `program_id` (`program_id`),
  CONSTRAINT `app_company_campaign_affiliate_links_ibfk_2` FOREIGN KEY (`seller_id`) REFERENCES `app_company_campaign_affiliate_sellers` (`seller_id`),
  CONSTRAINT `app_company_campaign_affiliate_links_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_affiliate_links_ibfk_4` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_affiliate_links_ibfk_5` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_affiliate_links_ibfk_6` FOREIGN KEY (`program_id`) REFERENCES `app_company_campaign_affiliate_program` (`program_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_affiliate_orders`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_affiliate_orders` (
  `order_id` varchar(36) NOT NULL,
  `order_session_id` varchar(255) DEFAULT NULL,
  `order_value` float DEFAULT NULL,
  `order_created` datetime DEFAULT NULL,
  `order_payment_enable` datetime DEFAULT NULL,
  `order_status` int(11) DEFAULT NULL,
  `order_external_id` varchar(255) DEFAULT NULL,
  `order_items` json DEFAULT NULL,
  `affiliate_id` varchar(36) DEFAULT NULL,
  `seller_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `event_created` datetime DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `affiliate_id` (`affiliate_id`),
  KEY `seller_id` (`seller_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_campaign_affiliate_orders_ibfk_1` FOREIGN KEY (`affiliate_id`) REFERENCES `app_company_campaign_affiliates` (`affiliate_id`),
  CONSTRAINT `app_company_campaign_affiliate_orders_ibfk_2` FOREIGN KEY (`seller_id`) REFERENCES `app_company_campaign_affiliate_sellers` (`seller_id`),
  CONSTRAINT `app_company_campaign_affiliate_orders_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_affiliate_orders_ibfk_4` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_affiliate_orders_ibfk_5` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_affiliate_program`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_affiliate_program` (
  `program_id` varchar(36) NOT NULL,
  `program_name` varchar(255) DEFAULT NULL,
  `program_slug` varchar(255) DEFAULT NULL,
  `program_cover` varchar(255) DEFAULT NULL,
  `program_url` varchar(255) DEFAULT NULL,
  `program_status` int(11) DEFAULT NULL,
  `program_commission` float DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`program_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_affiliate_program_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_affiliate_program_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_affiliate_program_booster`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_affiliate_program_booster` (
  `booster_id` varchar(36) NOT NULL,
  `booster_month` int(11) DEFAULT NULL,
  `booster_year` int(11) DEFAULT NULL,
  `booster_reference_start` datetime DEFAULT NULL,
  `booster_reference_end` datetime DEFAULT NULL,
  `program_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `group_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`booster_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `group_id` (`group_id`),
  KEY `program_id` (`program_id`),
  CONSTRAINT `app_company_campaign_affiliate_program_booster_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_affiliate_program_booster_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_affiliate_program_booster_ibfk_4` FOREIGN KEY (`group_id`) REFERENCES `app_company_campaign_affiliate_program_groups` (`group_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campaign_affiliate_program_booster_ibfk_5` FOREIGN KEY (`program_id`) REFERENCES `app_company_campaign_affiliate_program` (`program_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_affiliate_program_booster_tier`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_affiliate_program_booster_tier` (
  `tier_id` varchar(36) NOT NULL,
  `tier_count` int(11) DEFAULT NULL,
  `tier_commission` float DEFAULT NULL,
  `booster_id` varchar(36) DEFAULT NULL,
  `program_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`tier_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `booster_id` (`booster_id`),
  KEY `program_id` (`program_id`),
  CONSTRAINT `app_company_campaign_affiliate_program_booster_tier_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_affiliate_program_booster_tier_ibfk_4` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_affiliate_program_booster_tier_ibfk_5` FOREIGN KEY (`booster_id`) REFERENCES `app_company_campaign_affiliate_program_booster` (`booster_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campaign_affiliate_program_booster_tier_ibfk_6` FOREIGN KEY (`program_id`) REFERENCES `app_company_campaign_affiliate_program` (`program_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_affiliate_program_group_sellers`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_affiliate_program_group_sellers` (
  `item_id` varchar(36) NOT NULL,
  `group_id` varchar(36) DEFAULT NULL,
  `seller_id` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `seller_id` (`seller_id`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `app_company_campaign_affiliate_program_group_sellers_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_affiliate_program_group_sellers_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_affiliate_program_group_sellers_ibfk_3` FOREIGN KEY (`seller_id`) REFERENCES `app_company_campaign_affiliate_sellers` (`seller_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campaign_affiliate_program_group_sellers_ibfk_4` FOREIGN KEY (`group_id`) REFERENCES `app_company_campaign_affiliate_program_groups` (`group_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_affiliate_program_groups`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_affiliate_program_groups` (
  `group_id` varchar(36) NOT NULL,
  `group_name` varchar(255) DEFAULT NULL,
  `group_commission` float DEFAULT NULL,
  `program_id` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`group_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `program_id` (`program_id`),
  CONSTRAINT `app_company_campaign_affiliate_program_groups_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_affiliate_program_groups_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_affiliate_program_groups_ibfk_3` FOREIGN KEY (`program_id`) REFERENCES `app_company_campaign_affiliate_program` (`program_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_affiliate_seller_order_items`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_affiliate_seller_order_items` (
  `item_id` varchar(36) NOT NULL,
  `item_quantity` int(11) DEFAULT NULL,
  `item_value` float DEFAULT NULL,
  `item_final_value` float DEFAULT NULL,
  `item_external_id` varchar(255) DEFAULT NULL,
  `item_description` varchar(255) DEFAULT NULL,
  `item_notes` varchar(255) DEFAULT NULL,
  `order_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `app_company_campaign_affiliate_seller_order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `app_company_campaign_affiliate_seller_orders` (`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_affiliate_seller_orders`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_affiliate_seller_orders` (
  `order_id` varchar(36) NOT NULL,
  `order_value` float DEFAULT NULL,
  `order_created` datetime DEFAULT NULL,
  `order_payment_enable` datetime DEFAULT NULL,
  `order_status` int(11) DEFAULT NULL,
  `order_external_id` varchar(255) DEFAULT NULL,
  `order_commission_percent` float DEFAULT NULL,
  `order_commission_value` float DEFAULT NULL,
  `session_id` varchar(36) DEFAULT NULL,
  `tier_id` varchar(36) DEFAULT NULL,
  `program_id` varchar(36) DEFAULT NULL,
  `seller_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `order_random_code` varchar(255) DEFAULT NULL,
  `utm_term` varchar(255) DEFAULT NULL,
  `utm_content` varchar(255) DEFAULT NULL,
  `order_payment_request` int(11) DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  KEY `program_id` (`program_id`),
  KEY `session_id` (`session_id`),
  KEY `tier_id` (`tier_id`),
  KEY `seller_id` (`seller_id`),
  CONSTRAINT `app_company_campaign_affiliate_seller_orders_ibfk_10` FOREIGN KEY (`tier_id`) REFERENCES `app_company_campaign_affiliate_program_booster_tier` (`tier_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campaign_affiliate_seller_orders_ibfk_11` FOREIGN KEY (`seller_id`) REFERENCES `app_company_campaign_affiliate_sellers` (`seller_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campaign_affiliate_seller_orders_ibfk_5` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_affiliate_seller_orders_ibfk_6` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_affiliate_seller_orders_ibfk_7` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_affiliate_seller_orders_ibfk_8` FOREIGN KEY (`program_id`) REFERENCES `app_company_campaign_affiliate_program` (`program_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campaign_affiliate_seller_orders_ibfk_9` FOREIGN KEY (`session_id`) REFERENCES `app_company_campaign_affiliate_session` (`session_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_affiliate_seller_payments`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_affiliate_seller_payments` (
  `payment_id` varchar(36) NOT NULL,
  `payment_reference_month` int(11) DEFAULT NULL,
  `payment_reference_year` int(11) DEFAULT NULL,
  `payment_value` float DEFAULT NULL,
  `payment_status` int(11) DEFAULT NULL,
  `payment_created` datetime DEFAULT NULL,
  `payment_change_status` datetime DEFAULT NULL,
  `payment_comments` text,
  `payment_fiscal_file` varchar(255) DEFAULT NULL,
  `payment_pix_type` varchar(255) DEFAULT NULL,
  `payment_pix_key` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `payment_receipt_file` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_campaign_affiliate_seller_payments_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_affiliate_seller_payments_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_affiliate_seller_payments_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_affiliate_sellers`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_affiliate_sellers` (
  `seller_id` varchar(36) NOT NULL,
  `seller_code` varchar(16) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`seller_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_campaign_affiliate_sellers_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_affiliate_sellers_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_affiliate_sellers_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_affiliate_session`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_affiliate_session` (
  `session_id` varchar(36) NOT NULL,
  `session_external_id` varchar(255) DEFAULT NULL,
  `session_created` datetime DEFAULT NULL,
  `session_events` int(11) DEFAULT '0',
  `session_last_event` datetime DEFAULT NULL,
  `program_id` varchar(36) DEFAULT NULL,
  `link_id` varchar(36) DEFAULT NULL,
  `seller_id` varchar(36) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`session_id`),
  KEY `user_id` (`user_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `program_id` (`program_id`),
  KEY `link_id` (`link_id`),
  KEY `seller_id` (`seller_id`),
  CONSTRAINT `app_company_campaign_affiliate_session_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_affiliate_session_ibfk_5` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_affiliate_session_ibfk_6` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_affiliate_session_ibfk_7` FOREIGN KEY (`program_id`) REFERENCES `app_company_campaign_affiliate_program` (`program_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campaign_affiliate_session_ibfk_8` FOREIGN KEY (`link_id`) REFERENCES `app_company_campaign_affiliate_links` (`link_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campaign_affiliate_session_ibfk_9` FOREIGN KEY (`seller_id`) REFERENCES `app_company_campaign_affiliate_sellers` (`seller_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_affiliate_session_events`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_affiliate_session_events` (
  `event_id` varchar(36) NOT NULL,
  `event_term` varchar(255) DEFAULT NULL,
  `event_content` varchar(255) DEFAULT NULL,
  `event_type` varchar(255) DEFAULT NULL,
  `event_custom_data` json DEFAULT NULL,
  `event_created` datetime DEFAULT NULL,
  `session_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  KEY `session_id` (`session_id`),
  CONSTRAINT `app_company_campaign_affiliate_session_events_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `app_company_campaign_affiliate_session` (`session_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_affiliates`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_affiliates` (
  `affiliate_id` varchar(36) NOT NULL,
  `affiliate_name` varchar(255) DEFAULT NULL,
  `affiliate_code` varchar(255) DEFAULT NULL,
  `affiliate_description` varchar(255) DEFAULT NULL,
  `affiliate_cover` varchar(255) DEFAULT NULL,
  `affiliate_status` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`affiliate_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_affiliates_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_affiliates_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_cashback_installment`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_cashback_installment` (
  `installment_id` int(11) NOT NULL AUTO_INCREMENT,
  `installment_number` int(11) DEFAULT NULL,
  `installment_tax` float DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `installment_status` int(11) DEFAULT '1',
  `installment_uuid` varchar(255) DEFAULT NULL,
  `installment_description` varchar(255) DEFAULT NULL,
  `installment_external_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`installment_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_cashback_installment_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_cashback_order`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_cashback_order` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_uuid` varchar(255) DEFAULT NULL,
  `order_created` datetime DEFAULT NULL,
  `order_external_id` varchar(255) DEFAULT NULL,
  `order_status` int(11) DEFAULT NULL,
  `order_status_change` datetime DEFAULT NULL,
  `order_note` varchar(255) DEFAULT NULL,
  `order_total` float DEFAULT NULL,
  `order_cashback_used` float DEFAULT NULL,
  `order_cashback_generated` float DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `order_payment_method` varchar(255) DEFAULT NULL,
  `order_installment_id` int(11) DEFAULT NULL,
  `order_installment_final_value` float DEFAULT NULL,
  `order_total_tax` float DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  KEY `app_company_campaign_cashback_order_relation_4` (`order_installment_id`),
  CONSTRAINT `app_company_campaign_cashback_order_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_cashback_order_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_cashback_order_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_cashback_order_relation_4` FOREIGN KEY (`order_installment_id`) REFERENCES `app_company_campaign_cashback_installment` (`installment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=217 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_cashback_order_item`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_cashback_order_item` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `item_quantity` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `item_uuid` varchar(255) DEFAULT NULL,
  `product_price` float DEFAULT NULL,
  `product_ipi` float DEFAULT NULL,
  `product_icms` float DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `app_company_campaign_cashback_order_item_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_cashback_order_item_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_cashback_order_item_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_cashback_order_item_ibfk_4` FOREIGN KEY (`order_id`) REFERENCES `app_company_campaign_cashback_order` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=265 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_cashback_product`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_cashback_product` (
  `product_id` int(11) NOT NULL AUTO_INCREMENT,
  `product_uuid` varchar(255) DEFAULT NULL,
  `product_external_id` varchar(255) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `product_description` text,
  `product_price` float DEFAULT NULL,
  `product_cashback` float DEFAULT NULL,
  `product_category` varchar(255) DEFAULT NULL,
  `product_cover` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `product_icms` float DEFAULT NULL,
  `product_ipi` float DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_cashback_product_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_cashback_product_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB AUTO_INCREMENT=288 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_cashback_trade`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_cashback_trade` (
  `trade_id` int(11) NOT NULL AUTO_INCREMENT,
  `trade_name` varchar(255) DEFAULT NULL,
  `trade_email` varchar(255) DEFAULT NULL,
  `trade_code` varchar(255) DEFAULT NULL,
  `trade_observation` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`trade_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_cashback_trade_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_cashback_trade_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_cashback_wallet`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_cashback_wallet` (
  `wallet_id` int(11) NOT NULL AUTO_INCREMENT,
  `wallet_uuid` varchar(255) DEFAULT NULL,
  `wallet_amount` float DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`wallet_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_campaign_cashback_wallet_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_cashback_wallet_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_cashback_wallet_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_cashback_wallet_extract`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_cashback_wallet_extract` (
  `extract_id` int(11) NOT NULL AUTO_INCREMENT,
  `extract_uuid` varchar(36) DEFAULT NULL,
  `extract_created` datetime DEFAULT NULL,
  `extract_type` varchar(10) DEFAULT NULL,
  `extract_description` varchar(255) DEFAULT NULL,
  `extract_value` float DEFAULT NULL,
  `extract_wallet_current` float DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `wallet_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`extract_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  KEY `wallet_id` (`wallet_id`),
  KEY `app_company_campaign_cashback_wallet_extract_relation_5` (`order_id`),
  CONSTRAINT `app_company_campaign_cashback_wallet_extract_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_cashback_wallet_extract_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_cashback_wallet_extract_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_cashback_wallet_extract_ibfk_4` FOREIGN KEY (`wallet_id`) REFERENCES `app_company_campaign_cashback_wallet` (`wallet_id`),
  CONSTRAINT `app_company_campaign_cashback_wallet_extract_relation_5` FOREIGN KEY (`order_id`) REFERENCES `app_company_campaign_cashback_order` (`order_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=118 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_checkout`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_checkout` (
  `checkout_id` varchar(36) NOT NULL,
  `checkout_name` varchar(255) DEFAULT NULL,
  `checkout_description` text,
  `checkout_terms` text,
  `checkout_cover` varchar(255) DEFAULT NULL,
  `checkout_status` int(11) DEFAULT NULL,
  `checkout_start` datetime DEFAULT NULL,
  `checkout_end` datetime DEFAULT NULL,
  `checkout_redeem_type` int(11) DEFAULT NULL,
  `checkout_redeem_date` datetime DEFAULT NULL,
  `checkout_redeem_immediate` int(11) DEFAULT NULL,
  `checkout_budget_total` float DEFAULT NULL,
  `checkout_budget_used` float DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `brand_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`checkout_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `brand_id` (`brand_id`),
  CONSTRAINT `app_company_campaign_checkout_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_checkout_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_checkout_ibfk_3` FOREIGN KEY (`brand_id`) REFERENCES `app_company_campaign_checkout_brand` (`brand_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_checkout_brand`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_checkout_brand` (
  `brand_id` varchar(36) NOT NULL,
  `brand_cover` varchar(255) DEFAULT NULL,
  `brand_name` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`brand_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_checkout_brand_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_checkout_brand_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_checkout_category`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_checkout_category` (
  `category_id` varchar(36) NOT NULL,
  `category_name` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_checkout_category_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_checkout_category_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_checkout_item`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_checkout_item` (
  `item_id` varchar(36) NOT NULL,
  `item_value` float DEFAULT NULL,
  `checkout_id` varchar(36) DEFAULT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `checkout_id` (`checkout_id`),
  KEY `product_id` (`product_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_checkout_item_ibfk_1` FOREIGN KEY (`checkout_id`) REFERENCES `app_company_campaign_checkout` (`checkout_id`),
  CONSTRAINT `app_company_campaign_checkout_item_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `app_company_campaign_checkout_product` (`product_id`),
  CONSTRAINT `app_company_campaign_checkout_item_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_checkout_item_ibfk_4` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_checkout_order`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_checkout_order` (
  `order_id` varchar(36) NOT NULL,
  `order_external_id` varchar(255) DEFAULT NULL,
  `order_created` datetime DEFAULT NULL,
  `order_sell_date` datetime DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_checkout_order_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_checkout_order_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_checkout_order_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_checkout_order_item`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_checkout_order_item` (
  `item_id` varchar(36) NOT NULL,
  `item_value` float DEFAULT NULL,
  `checkout_id` varchar(36) DEFAULT NULL,
  `order_id` varchar(36) DEFAULT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `item_redeem_available` int(11) DEFAULT NULL,
  `item_redeem_status` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `checkout_id` (`checkout_id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_checkout_order_item_ibfk_1` FOREIGN KEY (`checkout_id`) REFERENCES `app_company_campaign_checkout` (`checkout_id`),
  CONSTRAINT `app_company_campaign_checkout_order_item_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `app_company_campaign_checkout_order` (`order_id`),
  CONSTRAINT `app_company_campaign_checkout_order_item_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `app_company_campaign_checkout_product` (`product_id`),
  CONSTRAINT `app_company_campaign_checkout_order_item_ibfk_4` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_checkout_order_item_ibfk_5` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_checkout_order_item_ibfk_6` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_checkout_product`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_checkout_product` (
  `product_id` varchar(36) NOT NULL,
  `product_external_id` varchar(36) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `product_cover` varchar(255) DEFAULT NULL,
  `product_content` text,
  `category_id` varchar(36) DEFAULT NULL,
  `brand_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  KEY `category_id` (`category_id`),
  KEY `brand_id` (`brand_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_checkout_product_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `app_company_campaign_checkout_category` (`category_id`),
  CONSTRAINT `app_company_campaign_checkout_product_ibfk_2` FOREIGN KEY (`brand_id`) REFERENCES `app_company_campaign_checkout_brand` (`brand_id`),
  CONSTRAINT `app_company_campaign_checkout_product_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_checkout_product_ibfk_4` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_discount`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_discount` (
  `discount_id` varchar(36) NOT NULL,
  `discount_status` int(11) DEFAULT NULL,
  `discount_start` datetime DEFAULT NULL,
  `discount_end` datetime DEFAULT NULL,
  `discount_name` varchar(255) DEFAULT NULL,
  `discount_value` float DEFAULT NULL,
  `discount_rules` text,
  `discount_cover` varchar(255) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `discount_limit_usage` int(11) DEFAULT NULL,
  `discount_limit_value` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `discount_required_workers` int(11) DEFAULT '1',
  `discount_max_value_usage` int(11) DEFAULT NULL,
  PRIMARY KEY (`discount_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_discount_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_discount_business`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_discount_business` (
  `business_id` varchar(36) NOT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `store_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`business_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `app_company_campaign_discount_business_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_discount_business_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_discount_business_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_discount_business_ibfk_4` FOREIGN KEY (`store_id`) REFERENCES `app_company_campaign_discount_store` (`store_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_discount_group`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_discount_group` (
  `item_id` varchar(36) NOT NULL,
  `discount_id` varchar(36) DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `discount_id` (`discount_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `app_company_campaign_discount_group_ibfk_1` FOREIGN KEY (`discount_id`) REFERENCES `app_company_campaign_discount` (`discount_id`),
  CONSTRAINT `app_company_campaign_discount_group_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_discount_group_ibfk_4` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_discount_group_ibfk_5` FOREIGN KEY (`group_id`) REFERENCES `app_company_group` (`group_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_discount_lottery`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_discount_lottery` (
  `lottery_id` varchar(36) NOT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `lottery_name` varchar(255) NOT NULL,
  `lottery_status` tinyint(1) NOT NULL DEFAULT '1',
  `lottery_start_date` datetime NOT NULL,
  `lottery_end_date` datetime NOT NULL,
  `lottery_draw_date` datetime NOT NULL,
  `lottery_ticket_value` decimal(12,2) NOT NULL,
  `lottery_cumulative` tinyint(1) NOT NULL DEFAULT '1',
  `lottery_draw_type` varchar(10) NOT NULL DEFAULT 'random',
  `lottery_rules` longtext,
  `lottery_rules_file` varchar(500) DEFAULT NULL,
  `lottery_federal_number` varchar(6) DEFAULT NULL,
  `lottery_drawn_at` datetime DEFAULT NULL,
  `lottery_drawn_by` int(11) DEFAULT NULL,
  `lottery_ticket_status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0=idle, 1=generating, 2=generated',
  `lottery_ticket_total` int(11) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `lottery_ticket_expected` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`lottery_id`),
  KEY `idx_campaign` (`campaign_id`),
  KEY `idx_company` (`company_id`),
  KEY `fk_lottery_drawn_by` (`lottery_drawn_by`),
  CONSTRAINT `fk_lottery_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lottery_company` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lottery_drawn_by` FOREIGN KEY (`lottery_drawn_by`) REFERENCES `app_company_user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_discount_lottery_prize`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_discount_lottery_prize` (
  `prize_id` varchar(36) NOT NULL,
  `lottery_id` varchar(36) NOT NULL,
  `prize_name` varchar(255) NOT NULL,
  `prize_description` text,
  `prize_position` int(11) NOT NULL,
  `prize_image` varchar(500) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`prize_id`),
  KEY `idx_lottery` (`lottery_id`),
  KEY `idx_position` (`lottery_id`,`prize_position`),
  KEY `fk_lottery_prize_campaign` (`campaign_id`),
  KEY `fk_lottery_prize_company` (`company_id`),
  CONSTRAINT `fk_lottery_prize_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lottery_prize_company` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lottery_prize_lottery` FOREIGN KEY (`lottery_id`) REFERENCES `app_company_campaign_discount_lottery` (`lottery_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_discount_lottery_store`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_discount_lottery_store` (
  `item_id` varchar(36) NOT NULL,
  `lottery_id` varchar(36) NOT NULL,
  `store_id` varchar(36) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`item_id`),
  UNIQUE KEY `uq_lottery_store` (`lottery_id`,`store_id`),
  KEY `idx_lottery` (`lottery_id`),
  KEY `idx_store` (`store_id`),
  KEY `fk_lottery_store_campaign` (`campaign_id`),
  KEY `fk_lottery_store_company` (`company_id`),
  CONSTRAINT `fk_lottery_store_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lottery_store_company` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lottery_store_lottery` FOREIGN KEY (`lottery_id`) REFERENCES `app_company_campaign_discount_lottery` (`lottery_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lottery_store_store` FOREIGN KEY (`store_id`) REFERENCES `app_company_campaign_discount_store` (`store_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_discount_lottery_ticket`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_discount_lottery_ticket` (
  `ticket_id` varchar(36) NOT NULL,
  `lottery_id` varchar(36) NOT NULL,
  `business_id` varchar(36) DEFAULT NULL,
  `store_id` varchar(36) DEFAULT NULL,
  `ticket_number` varchar(20) NOT NULL,
  `ticket_is_winner` tinyint(1) NOT NULL DEFAULT '0',
  `prize_id` varchar(36) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `register_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`ticket_id`),
  KEY `idx_lottery` (`lottery_id`),
  KEY `idx_business` (`business_id`),
  KEY `idx_winner` (`lottery_id`,`ticket_is_winner`),
  KEY `idx_number` (`lottery_id`,`ticket_number`),
  KEY `fk_lottery_ticket_store` (`store_id`),
  KEY `fk_lottery_ticket_prize` (`prize_id`),
  KEY `fk_lottery_ticket_campaign` (`campaign_id`),
  KEY `fk_lottery_ticket_company` (`company_id`),
  KEY `idx_register` (`register_id`),
  CONSTRAINT `fk_lottery_ticket_business` FOREIGN KEY (`business_id`) REFERENCES `app_company_campaign_discount_business` (`business_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lottery_ticket_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lottery_ticket_company` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lottery_ticket_lottery` FOREIGN KEY (`lottery_id`) REFERENCES `app_company_campaign_discount_lottery` (`lottery_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lottery_ticket_prize` FOREIGN KEY (`prize_id`) REFERENCES `app_company_campaign_discount_lottery_prize` (`prize_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_lottery_ticket_store` FOREIGN KEY (`store_id`) REFERENCES `app_company_campaign_discount_store` (`store_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_discount_products`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_discount_products` (
  `product_id` varchar(36) NOT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `product_external_id` varchar(255) DEFAULT NULL,
  `product_rex_external_id` varchar(255) DEFAULT NULL,
  `product_image` varchar(255) DEFAULT NULL,
  `product_description` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `product_category` varchar(255) DEFAULT NULL,
  `product_size` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  KEY `app_company_campaign_discount_products_ibfk_1` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_discount_products_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `campaign_id` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_discount_register`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_discount_register` (
  `register_id` varchar(255) NOT NULL,
  `register_created` datetime DEFAULT NULL,
  `register_total_value` decimal(10,2) DEFAULT NULL,
  `register_discount` float DEFAULT NULL,
  `register_order_number` varchar(128) DEFAULT NULL,
  `register_order_file` varchar(255) DEFAULT NULL,
  `code_id` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `store_id` varchar(255) DEFAULT NULL,
  `business_id` varchar(255) DEFAULT NULL,
  `discount_id` varchar(255) DEFAULT NULL,
  `worker_id` varchar(255) DEFAULT NULL,
  `item_quantity` int(11) DEFAULT NULL,
  `seller_id` varchar(36) DEFAULT NULL,
  `register_rex_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`register_id`),
  KEY `code_id` (`code_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `store_id` (`store_id`),
  KEY `fk_seller` (`seller_id`),
  KEY `business_id` (`business_id`),
  KEY `discount_id` (`discount_id`),
  KEY `worker_id` (`worker_id`),
  CONSTRAINT `app_company_campaign_discount_register_ibfk_1` FOREIGN KEY (`code_id`) REFERENCES `app_company_campaign_discount_worker_code` (`code_id`),
  CONSTRAINT `app_company_campaign_discount_register_ibfk_2` FOREIGN KEY (`worker_id`) REFERENCES `app_company_campaign_discount_worker` (`worker_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `app_company_campaign_discount_register_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_discount_register_ibfk_4` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_discount_register_ibfk_5` FOREIGN KEY (`store_id`) REFERENCES `app_company_campaign_discount_store` (`store_id`),
  CONSTRAINT `app_company_campaign_discount_register_ibfk_6` FOREIGN KEY (`business_id`) REFERENCES `app_company_campaign_discount_business` (`business_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `app_company_campaign_discount_register_ibfk_7` FOREIGN KEY (`discount_id`) REFERENCES `app_company_campaign_discount` (`discount_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `app_company_campaign_discount_register_ibfk_8` FOREIGN KEY (`seller_id`) REFERENCES `app_company_campaign_discount_store_seller` (`seller_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_discount_register_files`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_discount_register_files` (
  `file_id` varchar(36) NOT NULL,
  `file_url` varchar(1000) DEFAULT NULL,
  `register_id` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `file_number` varchar(255) DEFAULT NULL,
  `file_status` tinyint(4) DEFAULT '0',
  `file_message` text,
  `file_approved_at` datetime DEFAULT NULL,
  `file_rejected_at` datetime DEFAULT NULL,
  `file_reviewed_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`file_id`),
  KEY `register_id` (`register_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_discount_register_products`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_discount_register_products` (
  `item_id` varchar(36) NOT NULL,
  `register_id` varchar(36) DEFAULT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `product_quantity` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `product_id` (`product_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `company_id` (`company_id`),
  KEY `register_id` (`register_id`),
  CONSTRAINT `app_company_campaign_discount_register_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `app_company_campaign_discount_products` (`product_id`),
  CONSTRAINT `app_company_campaign_discount_register_products_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_discount_register_products_ibfk_4` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_discount_register_products_ibfk_5` FOREIGN KEY (`register_id`) REFERENCES `app_company_campaign_discount_register` (`register_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_discount_segmentation_products`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_discount_segmentation_products` (
  `item_id` varchar(36) NOT NULL,
  `product_id` varchar(255) DEFAULT NULL,
  `discount_id` varchar(255) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_campaign_discount_segmentation_products_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_discount_segmentation_products_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_discount_segmentation_store`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_discount_segmentation_store` (
  `item_id` varchar(36) NOT NULL,
  `store_id` varchar(36) DEFAULT NULL,
  `discount_id` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `store_id` (`store_id`),
  KEY `discount_id` (`discount_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_discount_segmentation_store_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `app_company_campaign_discount_store` (`store_id`),
  CONSTRAINT `app_company_campaign_discount_segmentation_store_ibfk_2` FOREIGN KEY (`discount_id`) REFERENCES `app_company_campaign_discount` (`discount_id`),
  CONSTRAINT `app_company_campaign_discount_segmentation_store_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_discount_segmentation_store_ibfk_4` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_discount_store`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_discount_store` (
  `store_id` varchar(36) NOT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `store_status` int(11) DEFAULT '1',
  PRIMARY KEY (`store_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_campaign_discount_store_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_discount_store_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_discount_store_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_discount_store_code`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_discount_store_code` (
  `code_id` varchar(36) NOT NULL,
  `code_value` varchar(10) DEFAULT NULL,
  `code_initial_date` datetime DEFAULT NULL,
  `code_final_date` datetime DEFAULT NULL,
  `code_status` int(11) DEFAULT NULL,
  `store_id` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `code_limit_usage` int(11) DEFAULT NULL,
  `code_title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`code_id`),
  KEY `app_company_campaign_discount_store_code_ibfk_1` (`store_id`),
  CONSTRAINT `app_company_campaign_discount_store_code_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `app_company_campaign_discount_store` (`store_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_discount_store_code_user`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_discount_store_code_user` (
  `item_id` varchar(36) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `code_id` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `app_company_campaign_discount_store_code_user_ibfk_2` (`code_id`),
  KEY `app_company_campaign_discount_store_code_user_ibfk_1` (`user_id`),
  CONSTRAINT `app_company_campaign_discount_store_code_user_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campaign_discount_store_code_user_ibfk_2` FOREIGN KEY (`code_id`) REFERENCES `app_company_campaign_discount_store_code` (`code_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_discount_store_seller`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_discount_store_seller` (
  `seller_id` varchar(36) NOT NULL,
  `seller_name` varchar(255) DEFAULT NULL,
  `seller_document` varchar(255) DEFAULT NULL,
  `seller_phone` varchar(255) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `store_id` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `seller_email` varchar(255) DEFAULT NULL,
  `seller_status` int(11) DEFAULT '1',
  PRIMARY KEY (`seller_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `company_id` (`company_id`),
  KEY `app_company_campaign_discount_store_seller_ibfk_3` (`store_id`),
  CONSTRAINT `app_company_campaign_discount_store_seller_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_discount_store_seller_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_discount_store_seller_ibfk_3` FOREIGN KEY (`store_id`) REFERENCES `app_company_campaign_discount_store` (`store_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_discount_user`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_discount_user` (
  `item_id` varchar(36) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `discount_id` varchar(36) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `discount_id` (`discount_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `company_id` (`company_id`),
  KEY `app_company_campaign_discount_user_ibfk_1` (`user_id`),
  CONSTRAINT `app_company_campaign_discount_user_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campaign_discount_user_ibfk_2` FOREIGN KEY (`discount_id`) REFERENCES `app_company_campaign_discount` (`discount_id`),
  CONSTRAINT `app_company_campaign_discount_user_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_discount_user_ibfk_4` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_discount_worker`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_discount_worker` (
  `worker_id` varchar(36) NOT NULL,
  `worker_invite` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `business_id` varchar(36) DEFAULT NULL,
  `worker_document` varchar(255) DEFAULT NULL,
  `worker_phone` varchar(255) DEFAULT NULL,
  `worker_name` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`worker_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `app_company_campaign_discount_worker_ibfk_3` (`business_id`),
  CONSTRAINT `app_company_campaign_discount_worker_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_discount_worker_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_discount_worker_ibfk_3` FOREIGN KEY (`business_id`) REFERENCES `app_company_campaign_discount_business` (`business_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_discount_worker_code`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_discount_worker_code` (
  `code_id` varchar(36) NOT NULL,
  `code_voucher` varchar(36) DEFAULT NULL,
  `code_status` int(11) DEFAULT NULL,
  `code_created` datetime DEFAULT NULL,
  `discount_id` varchar(36) DEFAULT NULL,
  `worker_id` varchar(36) DEFAULT NULL,
  `business_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`code_id`),
  KEY `discount_id` (`discount_id`),
  KEY `app_company_campaign_discount_worker_code_ibfk_2` (`worker_id`),
  CONSTRAINT `app_company_campaign_discount_worker_code_ibfk_1` FOREIGN KEY (`discount_id`) REFERENCES `app_company_campaign_discount` (`discount_id`),
  CONSTRAINT `app_company_campaign_discount_worker_code_ibfk_2` FOREIGN KEY (`worker_id`) REFERENCES `app_company_campaign_discount_worker` (`worker_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_gift`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_gift` (
  `gift_id` varchar(36) NOT NULL,
  `gift_name` varchar(255) DEFAULT NULL,
  `gift_status` int(11) DEFAULT NULL,
  `gift_order` int(11) DEFAULT NULL,
  `gift_cover` varchar(255) DEFAULT NULL,
  `gift_thumb` varchar(255) DEFAULT NULL,
  `gift_description` text,
  `gift_instructions` text,
  `gift_total` int(11) DEFAULT NULL,
  `gift_digital_voucher` int(11) DEFAULT NULL,
  `gift_reserved` int(11) DEFAULT NULL,
  `gift_taked` int(11) DEFAULT NULL,
  `gift_gamification_coins` int(11) DEFAULT NULL,
  `gift_gamification_points` int(11) DEFAULT NULL,
  `gift_gamification_coins_expires` int(11) DEFAULT NULL,
  `gift_gamification_points_expires` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`gift_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_gift_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_gift_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_gift_config`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_gift_config` (
  `config_id` varchar(36) NOT NULL,
  `config_take` varchar(255) DEFAULT NULL,
  `config_gift_limit` int(11) DEFAULT '1',
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`config_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_gift_config_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_gift_config_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_gift_voucher`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_gift_voucher` (
  `voucher_id` varchar(36) NOT NULL,
  `voucher_code` varchar(255) DEFAULT NULL,
  `voucher_status` int(11) DEFAULT NULL,
  `voucher_created` datetime DEFAULT NULL,
  `voucher_taked` datetime DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `gift_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`voucher_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `gift_id` (`gift_id`),
  CONSTRAINT `app_company_campaign_gift_voucher_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_gift_voucher_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_gift_voucher_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_gift_voucher_ibfk_4` FOREIGN KEY (`gift_id`) REFERENCES `app_company_campaign_gift` (`gift_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_goal_log`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_goal_log` (
  `log_id` varchar(36) NOT NULL,
  `log_type` varchar(255) DEFAULT NULL,
  `log_description` varchar(255) DEFAULT NULL,
  `log_action` varchar(255) DEFAULT NULL,
  `log_value` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `log_created` datetime DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  KEY `user_id` (`user_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_goal_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_goal_log_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_goal_log_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_goal_setup`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_goal_setup` (
  `setup_id` varchar(36) NOT NULL,
  `setup_goal_all` int(11) DEFAULT NULL,
  `setup_goal_increment` float DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `setup_created` datetime DEFAULT NULL,
  PRIMARY KEY (`setup_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_goal_setup_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_goal_setup_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_goal_user`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_goal_user` (
  `goal_id` varchar(36) NOT NULL,
  `goal_value` float DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `weight_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`goal_id`),
  KEY `user_id` (`user_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `weight_id` (`weight_id`),
  CONSTRAINT `app_company_campaign_goal_user_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_goal_user_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_goal_user_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_goal_user_ibfk_4` FOREIGN KEY (`weight_id`) REFERENCES `app_company_campaign_goal_weight` (`weight_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_goal_user_register`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_goal_user_register` (
  `register_id` varchar(36) NOT NULL,
  `register_value` float DEFAULT NULL,
  `register_description` text,
  `register_created` datetime DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `weight_id` varchar(36) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`register_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `element_id` (`weight_id`),
  KEY `FK_User` (`user_id`),
  CONSTRAINT `FK_User` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_goal_user_register_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_goal_user_register_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_goal_user_register_ibfk_3` FOREIGN KEY (`weight_id`) REFERENCES `app_company_campaign_goal_weight` (`weight_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_goal_weight`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_goal_weight` (
  `weight_id` varchar(36) NOT NULL,
  `weight_name` varchar(255) DEFAULT NULL,
  `weight_value` float DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`weight_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_goal_weight_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_goal_weight_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_group`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_group` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign_id` int(11) DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `app_company_campaign_group_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_group_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `app_company_group` (`group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_gts_order`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_gts_order` (
  `order_id` varchar(36) NOT NULL,
  `order_created` datetime DEFAULT NULL,
  `order_billed` datetime DEFAULT NULL,
  `order_status` int(11) DEFAULT NULL,
  `order_message` text,
  `order_external_id` varchar(255) DEFAULT NULL,
  `order_total_value` float DEFAULT NULL,
  `order_seller` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_gts_order_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_gts_order_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_gts_order_item`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_gts_order_item` (
  `item_id` varchar(36) NOT NULL,
  `item_external_id` varchar(255) DEFAULT NULL,
  `item_variation_a` varchar(36) DEFAULT NULL,
  `item_variation_b` varchar(36) DEFAULT NULL,
  `item_quantity` int(11) DEFAULT NULL,
  `item_value` float DEFAULT NULL,
  `item_total_value` float DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `order_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `app_company_campaign_gts_order_item_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_gts_order_item_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_gts_order_item_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `app_company_campaign_gts_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_gts_product`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_gts_product` (
  `product_id` varchar(36) NOT NULL,
  `product_external_id` varchar(255) DEFAULT NULL,
  `product_variation_a` varchar(255) DEFAULT NULL,
  `product_variation_a_description` varchar(255) DEFAULT NULL,
  `product_variation_b` varchar(255) DEFAULT NULL,
  `product_variation_b_description` varchar(255) DEFAULT NULL,
  `product_cover` varchar(255) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `product_category` varchar(255) DEFAULT NULL,
  `product_subcategory` varchar(255) DEFAULT NULL,
  `product_brand` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_gts_product_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_gts_product_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_node`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_node` (
  `node_id` varchar(36) NOT NULL,
  `node_parent` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`node_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  KEY `node_parent` (`node_parent`),
  CONSTRAINT `app_company_campaign_node_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_node_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_node_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_node_ibfk_4` FOREIGN KEY (`node_parent`) REFERENCES `app_company_campaign_node` (`node_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_node_selecta_goal`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_node_selecta_goal` (
  `goal_id` varchar(36) NOT NULL,
  `goal_name` varchar(255) DEFAULT NULL,
  `goal_break` int(11) DEFAULT NULL,
  `goal_break_points` float DEFAULT NULL,
  `goal_elegible` float DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `goal_unit` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`goal_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_node_selecta_goal_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_node_selecta_goal_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_node_selecta_goal_value`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_node_selecta_goal_value` (
  `value_id` varchar(36) NOT NULL,
  `goal_id` varchar(36) DEFAULT NULL,
  `node_id` varchar(36) DEFAULT NULL,
  `value_goal` float DEFAULT NULL,
  `value_value` float DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`value_id`),
  KEY `goal_id` (`goal_id`),
  KEY `node_id` (`node_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_node_selecta_goal_value_ibfk_1` FOREIGN KEY (`goal_id`) REFERENCES `app_company_campaign_node_selecta_goal` (`goal_id`),
  CONSTRAINT `app_company_campaign_node_selecta_goal_value_ibfk_2` FOREIGN KEY (`node_id`) REFERENCES `app_company_campaign_node` (`node_id`),
  CONSTRAINT `app_company_campaign_node_selecta_goal_value_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_node_selecta_goal_value_ibfk_4` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_node_selecta_increment`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_node_selecta_increment` (
  `increment_id` varchar(36) NOT NULL,
  `increment_name` varchar(255) DEFAULT NULL,
  `increment_points` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`increment_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_node_selecta_increment_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_node_selecta_increment_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_node_selecta_increment_value`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_node_selecta_increment_value` (
  `value_id` varchar(36) NOT NULL,
  `value_value` int(11) DEFAULT NULL,
  `increment_id` varchar(255) DEFAULT NULL,
  `node_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`value_id`),
  KEY `increment_id` (`increment_id`),
  KEY `node_id` (`node_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_node_selecta_increment_value_ibfk_1` FOREIGN KEY (`increment_id`) REFERENCES `app_company_campaign_node_selecta_increment` (`increment_id`),
  CONSTRAINT `app_company_campaign_node_selecta_increment_value_ibfk_2` FOREIGN KEY (`node_id`) REFERENCES `app_company_campaign_node` (`node_id`),
  CONSTRAINT `app_company_campaign_node_selecta_increment_value_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_node_selecta_increment_value_ibfk_4` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_node_selecta_register`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_node_selecta_register` (
  `register_id` varchar(36) NOT NULL,
  `register_name` varchar(200) DEFAULT NULL,
  `register_points` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `register_description` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`register_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_campaign_node_selecta_register_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_node_selecta_register_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_node_selecta_register_file`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_node_selecta_register_file` (
  `file_id` varchar(36) NOT NULL,
  `file_url` varchar(1000) DEFAULT NULL,
  `file_status` int(11) DEFAULT NULL,
  `file_message` varchar(1000) DEFAULT NULL,
  `register_id` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `file_description` varchar(200) DEFAULT NULL,
  `node_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`file_id`),
  KEY `register_id` (`register_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `company_id` (`company_id`),
  KEY `node_id_fk` (`node_id`),
  CONSTRAINT `app_company_campaign_node_selecta_register_file_ibfk_1` FOREIGN KEY (`register_id`) REFERENCES `app_company_campaign_node_selecta_register` (`register_id`),
  CONSTRAINT `app_company_campaign_node_selecta_register_file_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_node_selecta_register_file_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `node_id_fk` FOREIGN KEY (`node_id`) REFERENCES `app_company_campaign_node` (`node_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_real_estate_admin`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_real_estate_admin` (
  `admin_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`admin_id`),
  KEY `user_id` (`user_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_real_estate_admin_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_real_estate_admin_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_real_estate_admin_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_real_estate_build`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_real_estate_build` (
  `build_id` int(11) NOT NULL AUTO_INCREMENT,
  `build_name` varchar(255) DEFAULT NULL,
  `build_status` int(11) DEFAULT NULL,
  `build_cover` varchar(255) DEFAULT NULL,
  `build_type` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`build_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_real_estate_build_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_real_estate_build_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_real_estate_build_tower`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_real_estate_build_tower` (
  `tower_id` int(11) NOT NULL AUTO_INCREMENT,
  `tower_name` varchar(255) DEFAULT NULL,
  `tower_status` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `build_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`tower_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `build_id` (`build_id`),
  CONSTRAINT `app_company_campaign_real_estate_build_tower_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_real_estate_build_tower_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_real_estate_build_tower_ibfk_3` FOREIGN KEY (`build_id`) REFERENCES `app_company_campaign_real_estate_build` (`build_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_real_estate_build_tower_unit`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_real_estate_build_tower_unit` (
  `unit_id` int(11) NOT NULL AUTO_INCREMENT,
  `unit_uuid` varchar(255) DEFAULT NULL,
  `unit_status` int(11) DEFAULT NULL,
  `unit_code` varchar(255) DEFAULT NULL,
  `unit_cover` varchar(255) DEFAULT NULL,
  `unit_details` text,
  `unit_value` float DEFAULT NULL,
  `unit_floor` varchar(255) DEFAULT NULL,
  `unit_map` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `build_id` int(11) DEFAULT NULL,
  `tower_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`unit_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `build_id` (`build_id`),
  KEY `tower_id` (`tower_id`),
  CONSTRAINT `app_company_campaign_real_estate_build_tower_unit_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_real_estate_build_tower_unit_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_real_estate_build_tower_unit_ibfk_3` FOREIGN KEY (`build_id`) REFERENCES `app_company_campaign_real_estate_build` (`build_id`),
  CONSTRAINT `app_company_campaign_real_estate_build_tower_unit_ibfk_4` FOREIGN KEY (`tower_id`) REFERENCES `app_company_campaign_real_estate_build_tower` (`tower_id`)
) ENGINE=InnoDB AUTO_INCREMENT=139 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_real_estate_register`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_real_estate_register` (
  `register_id` int(11) NOT NULL AUTO_INCREMENT,
  `register_uuid` varchar(255) DEFAULT NULL,
  `register_created` datetime DEFAULT NULL,
  `register_status` int(11) DEFAULT NULL,
  `register_status_change` datetime DEFAULT NULL,
  `register_amount_entry` float DEFAULT NULL,
  `register_amount_financing` float DEFAULT NULL,
  `register_response` varchar(1024) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `build_id` int(11) DEFAULT NULL,
  `tower_id` int(11) DEFAULT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `register_file` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`register_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `build_id` (`build_id`),
  KEY `tower_id` (`tower_id`),
  KEY `unit_id` (`unit_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_campaign_real_estate_register_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_real_estate_register_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_real_estate_register_ibfk_3` FOREIGN KEY (`build_id`) REFERENCES `app_company_campaign_real_estate_build` (`build_id`),
  CONSTRAINT `app_company_campaign_real_estate_register_ibfk_4` FOREIGN KEY (`tower_id`) REFERENCES `app_company_campaign_real_estate_build_tower` (`tower_id`),
  CONSTRAINT `app_company_campaign_real_estate_register_ibfk_5` FOREIGN KEY (`unit_id`) REFERENCES `app_company_campaign_real_estate_build_tower_unit` (`unit_id`),
  CONSTRAINT `app_company_campaign_real_estate_register_ibfk_6` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_real_estate_register_porposer`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_real_estate_register_porposer` (
  `porposer_id` int(11) NOT NULL AUTO_INCREMENT,
  `porposer_name` varchar(255) DEFAULT NULL,
  `porposer_document_cpf` varchar(255) DEFAULT NULL,
  `porposer_document_rg` varchar(255) DEFAULT NULL,
  `porposer_phone` varchar(255) DEFAULT NULL,
  `porposer_email` varchar(255) DEFAULT NULL,
  `porposer_principal` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `build_id` int(11) DEFAULT NULL,
  `tower_id` int(11) DEFAULT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `register_id` int(11) DEFAULT NULL,
  `porposer_birthdate` datetime DEFAULT NULL,
  `porposer_income` float DEFAULT NULL,
  PRIMARY KEY (`porposer_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `build_id` (`build_id`),
  KEY `tower_id` (`tower_id`),
  KEY `unit_id` (`unit_id`),
  KEY `register_id` (`register_id`),
  CONSTRAINT `app_company_campaign_real_estate_register_porposer_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_real_estate_register_porposer_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_real_estate_register_porposer_ibfk_3` FOREIGN KEY (`build_id`) REFERENCES `app_company_campaign_real_estate_build` (`build_id`),
  CONSTRAINT `app_company_campaign_real_estate_register_porposer_ibfk_4` FOREIGN KEY (`tower_id`) REFERENCES `app_company_campaign_real_estate_build_tower` (`tower_id`),
  CONSTRAINT `app_company_campaign_real_estate_register_porposer_ibfk_5` FOREIGN KEY (`unit_id`) REFERENCES `app_company_campaign_real_estate_build_tower_unit` (`unit_id`),
  CONSTRAINT `app_company_campaign_real_estate_register_porposer_ibfk_6` FOREIGN KEY (`register_id`) REFERENCES `app_company_campaign_real_estate_register` (`register_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_real_estate_register_porposer_file`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_real_estate_register_porposer_file` (
  `file_id` int(11) NOT NULL AUTO_INCREMENT,
  `file_name` varchar(255) DEFAULT NULL,
  `file_description` varchar(255) DEFAULT NULL,
  `file_file` varchar(255) DEFAULT NULL,
  `register_id` int(11) DEFAULT NULL,
  `porposer_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`file_id`),
  KEY `register_id` (`register_id`),
  KEY `porposer_id` (`porposer_id`),
  CONSTRAINT `app_company_campaign_real_estate_register_porposer_file_ibfk_1` FOREIGN KEY (`register_id`) REFERENCES `app_company_campaign_real_estate_register` (`register_id`),
  CONSTRAINT `app_company_campaign_real_estate_register_porposer_file_ibfk_2` FOREIGN KEY (`porposer_id`) REFERENCES `app_company_campaign_real_estate_register_porposer` (`porposer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_register`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_register` (
  `register_id` int(11) NOT NULL AUTO_INCREMENT,
  `register_uuid` varchar(255) DEFAULT NULL,
  `register_created` datetime DEFAULT NULL,
  `register_change_status` datetime DEFAULT NULL,
  `register_status` int(11) DEFAULT NULL,
  `register_protocol` varchar(255) DEFAULT NULL,
  `register_protocol_validator` varchar(255) DEFAULT NULL,
  `register_incentive_generate` varchar(255) DEFAULT NULL,
  `register_note` varchar(255) DEFAULT NULL,
  `register_sorted` int(11) DEFAULT '0',
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`register_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_campaign_register_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_register_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_register_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7905 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_reproved`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_reproved` (
  `reproved_id` int(11) NOT NULL AUTO_INCREMENT,
  `reproved_created` datetime DEFAULT NULL,
  `reproved_imported` datetime DEFAULT NULL,
  `reproved_protocol` varchar(255) DEFAULT NULL,
  `reproved_validator` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`reproved_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_campaign_reproved_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_reproved_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_reproved_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_actor_flags`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_actor_flags` (
  `item_id` varchar(36) NOT NULL,
  `actor_id` varchar(36) DEFAULT NULL,
  `flag_id` varchar(36) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `actor_id` (`actor_id`),
  KEY `flag_id` (`flag_id`),
  KEY `user_id` (`user_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_rex_actor_flags_ibfk_1` FOREIGN KEY (`actor_id`) REFERENCES `app_company_campaign_rex_actors` (`actor_id`),
  CONSTRAINT `app_company_campaign_rex_actor_flags_ibfk_2` FOREIGN KEY (`flag_id`) REFERENCES `app_company_campaign_rex_flags` (`flag_id`),
  CONSTRAINT `app_company_campaign_rex_actor_flags_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_rex_actor_flags_ibfk_4` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_rex_actor_flags_ibfk_5` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_actors`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_actors` (
  `actor_id` varchar(36) NOT NULL,
  `actor_status` int(11) DEFAULT NULL,
  `actor_disabled_date` datetime DEFAULT NULL,
  `actor_parent` varchar(36) DEFAULT NULL,
  `level_id` varchar(36) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`actor_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `actor_parent` (`actor_parent`),
  KEY `level_id` (`level_id`),
  CONSTRAINT `app_company_campaign_rex_actors_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_rex_actors_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_rex_actors_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_rex_actors_ibfk_4` FOREIGN KEY (`actor_parent`) REFERENCES `app_company_campaign_rex_actors` (`actor_id`),
  CONSTRAINT `app_company_campaign_rex_actors_ibfk_5` FOREIGN KEY (`level_id`) REFERENCES `app_company_campaign_rex_levels` (`level_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_brands`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_brands` (
  `brand_id` varchar(36) NOT NULL,
  `brand_cover` varchar(255) DEFAULT NULL,
  `brand_name` varchar(255) DEFAULT NULL,
  `brand_external_id` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`brand_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_rex_brands_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_rex_brands_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_categories`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_categories` (
  `category_id` varchar(36) NOT NULL,
  `category_name` varchar(255) DEFAULT NULL,
  `category_external_id` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_rex_categories_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_rex_categories_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_challenge_categories`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_challenge_categories` (
  `category_id` varchar(36) NOT NULL,
  `category_name` varchar(255) DEFAULT NULL,
  `category_slug` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_rex_challenge_categories_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_rex_challenge_categories_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_challenge_flags`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_challenge_flags` (
  `item_id` varchar(36) NOT NULL,
  `challenge_id` varchar(36) DEFAULT NULL,
  `flag_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `challenge_id` (`challenge_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_rex_challenge_flags_ibfk_1` FOREIGN KEY (`challenge_id`) REFERENCES `app_company_campaign_rex_challenges` (`challenge_id`),
  CONSTRAINT `app_company_campaign_rex_challenge_flags_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_rex_challenge_flags_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_challenge_multipliers`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_challenge_multipliers` (
  `multiplier_id` int(11) NOT NULL AUTO_INCREMENT,
  `multiplier_min` int(11) NOT NULL DEFAULT '0' COMMENT 'Quantidade mínima de produtos da faixa',
  `multiplier_max` int(11) DEFAULT NULL COMMENT 'Quantidade máxima de produtos da faixa (NULL = sem limite)',
  `multiplier_value` decimal(5,2) NOT NULL DEFAULT '1.00' COMMENT 'Multiplicador percentual (ex: 1.00, 1.50, 2.00)',
  `challenge_id` varchar(36) NOT NULL COMMENT 'UUID do challenge',
  `campaign_id` int(11) NOT NULL COMMENT 'ID da campanha',
  `company_id` int(11) NOT NULL COMMENT 'ID da empresa',
  PRIMARY KEY (`multiplier_id`),
  KEY `idx_challenge` (`challenge_id`),
  KEY `idx_campaign` (`campaign_id`),
  KEY `idx_company` (`company_id`),
  CONSTRAINT `app_company_campaign_rex_challenge_multipliers_ibfk_1` FOREIGN KEY (`challenge_id`) REFERENCES `app_company_campaign_rex_challenges` (`challenge_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campaign_rex_challenge_multipliers_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campaign_rex_challenge_multipliers_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2147483647 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_challenge_product_items`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_challenge_product_items` (
  `item_id` varchar(36) NOT NULL,
  `item_value` float DEFAULT NULL,
  `item_gamification_coins` float DEFAULT NULL,
  `item_gamification_points` float DEFAULT NULL,
  `item_max_discount` float DEFAULT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `challenge_id` varchar(36) DEFAULT NULL,
  `level_id` varchar(36) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `product_id` (`product_id`),
  KEY `challenge_id` (`challenge_id`),
  KEY `level_id` (`level_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_rex_challenge_product_items_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `app_company_campaign_rex_products` (`product_id`),
  CONSTRAINT `app_company_campaign_rex_challenge_product_items_ibfk_2` FOREIGN KEY (`challenge_id`) REFERENCES `app_company_campaign_rex_challenges` (`challenge_id`),
  CONSTRAINT `app_company_campaign_rex_challenge_product_items_ibfk_3` FOREIGN KEY (`level_id`) REFERENCES `app_company_campaign_rex_levels` (`level_id`),
  CONSTRAINT `app_company_campaign_rex_challenge_product_items_ibfk_4` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_rex_challenge_product_items_ibfk_5` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_challenges`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_challenges` (
  `challenge_id` varchar(36) NOT NULL,
  `challenge_name` varchar(255) DEFAULT NULL,
  `challenge_description` text,
  `challenge_terms` text,
  `challenge_cover` varchar(255) DEFAULT NULL,
  `challenge_status` int(11) DEFAULT NULL,
  `challenge_start` datetime DEFAULT NULL,
  `challenge_end` datetime DEFAULT NULL,
  `challenge_redeem_type` int(11) DEFAULT NULL,
  `challenge_redeem_date` datetime DEFAULT NULL,
  `challenge_redeem_immediate` int(11) DEFAULT NULL,
  `challenge_budget_total` float DEFAULT NULL,
  `challenge_budget_used` float DEFAULT NULL,
  `challenge_global` int(11) DEFAULT NULL,
  `challenge_rex_secret_key` varchar(255) DEFAULT NULL,
  `challenge_rex_secret_token` varchar(255) DEFAULT NULL,
  `challenge_archived` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `category_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`challenge_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `fk_challenge_category` (`category_id`),
  CONSTRAINT `app_company_campaign_rex_challenges_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_rex_challenges_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `fk_challenge_category` FOREIGN KEY (`category_id`) REFERENCES `app_company_campaign_rex_challenge_categories` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_chargeback_item_payments`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_chargeback_item_payments` (
  `payment_id` varchar(36) NOT NULL,
  `payment_value` float DEFAULT NULL,
  `payment_description` varchar(255) DEFAULT NULL,
  `item_id` varchar(36) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `item_id` (`item_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_rex_chargeback_item_payments_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `app_company_campaign_rex_chargeback_items` (`item_id`),
  CONSTRAINT `app_company_campaign_rex_chargeback_item_payments_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_rex_chargeback_item_payments_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_rex_chargeback_item_payments_ibfk_4` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_chargeback_items`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_chargeback_items` (
  `item_id` varchar(36) NOT NULL,
  `item_value` float DEFAULT NULL,
  `challenge_id` varchar(36) DEFAULT NULL,
  `chargeback_id` varchar(36) DEFAULT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `challenge_id` (`challenge_id`),
  KEY `chargeback_id` (`chargeback_id`),
  KEY `product_id` (`product_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_rex_chargeback_items_ibfk_1` FOREIGN KEY (`challenge_id`) REFERENCES `app_company_campaign_rex_challenges` (`challenge_id`),
  CONSTRAINT `app_company_campaign_rex_chargeback_items_ibfk_2` FOREIGN KEY (`chargeback_id`) REFERENCES `app_company_campaign_rex_chargebacks` (`chargeback_id`),
  CONSTRAINT `app_company_campaign_rex_chargeback_items_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `app_company_campaign_rex_products` (`product_id`),
  CONSTRAINT `app_company_campaign_rex_chargeback_items_ibfk_4` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_rex_chargeback_items_ibfk_5` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_rex_chargeback_items_ibfk_6` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_chargebacks`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_chargebacks` (
  `chargeback_id` varchar(36) NOT NULL,
  `chargeback_created` datetime DEFAULT NULL,
  `chargeback_date` datetime DEFAULT NULL,
  `chargeback_external_id` varchar(255) DEFAULT NULL,
  `chargeback_points_value` float DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `order_id` varchar(36) DEFAULT NULL,
  `order_external_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`chargeback_id`),
  KEY `user_id` (`user_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `app_company_campaign_rex_chargebacks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_rex_chargebacks_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_rex_chargebacks_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_rex_chargebacks_ibfk_4` FOREIGN KEY (`order_id`) REFERENCES `app_company_campaign_rex_orders` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_flags`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_flags` (
  `flag_id` varchar(36) NOT NULL,
  `flag_label` varchar(255) DEFAULT NULL,
  `flag_type` varchar(255) DEFAULT NULL,
  `flag_external_id` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`flag_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_rex_flags_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_rex_flags_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_groups`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_groups` (
  `group_id` varchar(36) NOT NULL,
  `group_name` varchar(255) DEFAULT NULL,
  `group_flag` varchar(255) DEFAULT NULL,
  `group_description` varchar(255) DEFAULT NULL,
  `group_tax_fixed` float DEFAULT '10',
  `group_tax_percent` float DEFAULT '10',
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`group_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_rex_groups_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_rex_groups_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_levels`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_levels` (
  `level_id` varchar(36) NOT NULL,
  `level_name` varchar(255) DEFAULT NULL,
  `level_flag` varchar(255) DEFAULT NULL,
  `level_description` varchar(255) DEFAULT NULL,
  `level_parent` varchar(36) DEFAULT NULL,
  `group_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`level_id`),
  KEY `group_id` (`group_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `level_parent` (`level_parent`),
  CONSTRAINT `app_company_campaign_rex_levels_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `app_company_campaign_rex_groups` (`group_id`),
  CONSTRAINT `app_company_campaign_rex_levels_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_rex_levels_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_rex_levels_ibfk_4` FOREIGN KEY (`level_parent`) REFERENCES `app_company_campaign_rex_levels` (`level_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_order_item_payments`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_order_item_payments` (
  `payment_id` varchar(36) NOT NULL,
  `payment_status` int(11) DEFAULT NULL,
  `payment_value` float DEFAULT NULL,
  `payment_available` float DEFAULT NULL,
  `payment_description` varchar(255) DEFAULT NULL,
  `item_id` varchar(36) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `challenge_id` varchar(255) DEFAULT NULL,
  `payment_accumulator` int(11) DEFAULT '0',
  `multiplier_id` varchar(255) DEFAULT NULL,
  `payment_multiplier_value` float DEFAULT '1',
  PRIMARY KEY (`payment_id`),
  KEY `item_id` (`item_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_rex_order_item_payments_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `app_company_campaign_rex_order_items` (`item_id`),
  CONSTRAINT `app_company_campaign_rex_order_item_payments_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_rex_order_item_payments_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_rex_order_item_payments_ibfk_4` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_order_items`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_order_items` (
  `item_id` varchar(36) NOT NULL,
  `item_value` float DEFAULT NULL,
  `item_discount_percent` float DEFAULT NULL,
  `item_discount_value` float DEFAULT NULL,
  `challenge_id` varchar(36) DEFAULT NULL,
  `order_id` varchar(36) DEFAULT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `challenge_id` (`challenge_id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_rex_order_items_ibfk_1` FOREIGN KEY (`challenge_id`) REFERENCES `app_company_campaign_rex_challenges` (`challenge_id`),
  CONSTRAINT `app_company_campaign_rex_order_items_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `app_company_campaign_rex_orders` (`order_id`),
  CONSTRAINT `app_company_campaign_rex_order_items_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `app_company_campaign_rex_products` (`product_id`),
  CONSTRAINT `app_company_campaign_rex_order_items_ibfk_4` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_rex_order_items_ibfk_5` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_rex_order_items_ibfk_6` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_orders`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_orders` (
  `order_id` varchar(36) NOT NULL,
  `order_external_id` varchar(255) DEFAULT NULL,
  `order_status` int(11) DEFAULT NULL,
  `order_created` datetime DEFAULT NULL,
  `order_sell_date` datetime DEFAULT NULL,
  `order_flags` varchar(1024) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_rex_orders_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_rex_orders_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_rex_orders_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_products`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_products` (
  `product_id` varchar(36) NOT NULL,
  `product_external_id` varchar(36) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `product_cover` varchar(255) DEFAULT NULL,
  `product_content` text,
  `category_id` varchar(36) DEFAULT NULL,
  `brand_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  KEY `category_id` (`category_id`),
  KEY `brand_id` (`brand_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_rex_products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `app_company_campaign_rex_categories` (`category_id`),
  CONSTRAINT `app_company_campaign_rex_products_ibfk_2` FOREIGN KEY (`brand_id`) REFERENCES `app_company_campaign_rex_brands` (`brand_id`),
  CONSTRAINT `app_company_campaign_rex_products_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_rex_products_ibfk_4` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_prov_order_items`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_prov_order_items` (
  `item_id` varchar(36) NOT NULL,
  `item_value` float DEFAULT NULL,
  `item_discount_percent` float DEFAULT NULL,
  `item_discount_value` float DEFAULT NULL,
  `order_id` varchar(36) DEFAULT NULL,
  `product_external_id` varchar(255) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `order_id` (`order_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_rex_prov_order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `app_company_campaign_rex_prov_orders` (`order_id`),
  CONSTRAINT `app_company_campaign_rex_prov_order_items_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_rex_prov_order_items_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_prov_orders`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_prov_orders` (
  `order_id` varchar(36) NOT NULL,
  `order_external_id` varchar(255) DEFAULT NULL,
  `order_flags` varchar(255) DEFAULT NULL,
  `order_created` datetime DEFAULT NULL,
  `order_sell_date` datetime DEFAULT NULL,
  `order_seller` varchar(255) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_rex_prov_orders_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_rex_prov_orders_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_transaction_payments`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_transaction_payments` (
  `id` varchar(36) NOT NULL,
  `transaction_id` varchar(36) NOT NULL,
  `payment_id` varchar(36) NOT NULL,
  `amount` float NOT NULL COMMENT 'Quanto deste payment foi usado nesta transacao',
  PRIMARY KEY (`id`),
  KEY `idx_transaction` (`transaction_id`),
  KEY `idx_payment` (`payment_id`),
  CONSTRAINT `app_company_campaign_rex_transaction_payments_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `app_company_campaign_rex_transactions` (`transaction_id`),
  CONSTRAINT `app_company_campaign_rex_transaction_payments_ibfk_2` FOREIGN KEY (`payment_id`) REFERENCES `app_company_campaign_rex_order_item_payments` (`payment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_rex_transactions`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_rex_transactions` (
  `transaction_id` varchar(36) NOT NULL,
  `transaction_protocol` varchar(50) NOT NULL,
  `transaction_type` enum('withdraw','reversal','manual_credit','manual_debit') NOT NULL,
  `transaction_status` enum('success','failed','reversed') NOT NULL DEFAULT 'success',
  `transaction_method` enum('pix','billet','manual') NOT NULL,
  `transaction_gross_value` float NOT NULL COMMENT 'Valor bruto solicitado',
  `transaction_tax_value` float NOT NULL DEFAULT '0' COMMENT 'Valor das taxas',
  `transaction_net_value` float NOT NULL COMMENT 'Valor liquido enviado',
  `transaction_tax_percent` float DEFAULT '0',
  `transaction_tax_fixed` float DEFAULT '0',
  `transaction_description` text,
  `transaction_created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reversal_of` varchar(36) DEFAULT NULL COMMENT 'Se type=reversal, aponta para a transacao original',
  `user_id` int(11) NOT NULL,
  `campaign_id` int(11) NOT NULL,
  `challenge_id` varchar(36) DEFAULT NULL COMMENT 'challenge vinculado a transacao manual',
  `company_id` int(11) NOT NULL,
  `reversed_by` int(11) DEFAULT NULL COMMENT 'user_id do admin que fez o estorno',
  `created_by` int(11) DEFAULT NULL COMMENT 'user_id do admin que criou a transacao manual',
  `reversal_reason` text,
  `reversal_client_message` text,
  `reversal_internal_note` text,
  `reversal_attachment` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`transaction_id`),
  UNIQUE KEY `transaction_protocol` (`transaction_protocol`),
  KEY `idx_user_campaign` (`user_id`,`campaign_id`),
  KEY `idx_company` (`company_id`),
  KEY `reversal_of` (`reversal_of`),
  KEY `idx_challenge` (`challenge_id`),
  CONSTRAINT `app_company_campaign_rex_transactions_ibfk_1` FOREIGN KEY (`reversal_of`) REFERENCES `app_company_campaign_rex_transactions` (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_route`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_route` (
  `route_id` int(11) NOT NULL AUTO_INCREMENT,
  `route_key` varchar(255) DEFAULT NULL,
  `route_master` varchar(255) DEFAULT NULL,
  `route_description` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`route_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_campaign_route_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_route_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_route_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9882 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sale_cluster`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sale_cluster` (
  `cluster_id` int(11) NOT NULL AUTO_INCREMENT,
  `cluster_name` varchar(255) NOT NULL,
  `cluster_description` text,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`cluster_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_campaign_sale_cluster_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_sale_cluster_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sale_cycle`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sale_cycle` (
  `cycle_id` int(11) NOT NULL AUTO_INCREMENT,
  `cycle_name` varchar(255) NOT NULL,
  `cycle_active` int(11) DEFAULT '0',
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`cycle_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_campaign_sale_cycle_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_sale_cycle_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sale_cycle_bonus`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sale_cycle_bonus` (
  `bonus_id` int(11) NOT NULL AUTO_INCREMENT,
  `bonus_value` float DEFAULT NULL,
  `bonus_description` varchar(255) DEFAULT NULL,
  `user_sale_id` int(11) DEFAULT NULL,
  `cycle_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`bonus_id`),
  KEY `user_sale_id` (`user_sale_id`),
  KEY `cycle_id` (`cycle_id`),
  CONSTRAINT `app_company_campaign_sale_cycle_bonus_ibfk_1` FOREIGN KEY (`user_sale_id`) REFERENCES `app_company_campaign_sale_user` (`id`),
  CONSTRAINT `app_company_campaign_sale_cycle_bonus_ibfk_2` FOREIGN KEY (`cycle_id`) REFERENCES `app_company_campaign_sale_cycle` (`cycle_id`)
) ENGINE=InnoDB AUTO_INCREMENT=540 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sale_cycle_penal`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sale_cycle_penal` (
  `penal_id` int(11) NOT NULL AUTO_INCREMENT,
  `penal_value` decimal(14,2) DEFAULT NULL,
  `user_sale_id` int(11) DEFAULT NULL,
  `cycle_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`penal_id`)
) ENGINE=InnoDB AUTO_INCREMENT=226 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sale_goal`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sale_goal` (
  `goal_id` int(11) NOT NULL AUTO_INCREMENT,
  `goal_name` varchar(255) NOT NULL,
  `goal_description` text,
  `goal_percent_points` int(11) DEFAULT NULL,
  `goal_break_points` int(11) DEFAULT NULL,
  `goal_max_points` int(11) NOT NULL DEFAULT '0',
  `cycle_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`goal_id`),
  KEY `cycle_id` (`cycle_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_campaign_sale_goal_ibfk_1` FOREIGN KEY (`cycle_id`) REFERENCES `app_company_campaign_sale_cycle` (`cycle_id`),
  CONSTRAINT `app_company_campaign_sale_goal_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_sale_goal_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sale_goal_user`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sale_goal_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `goal_id` int(11) DEFAULT NULL,
  `sale_user_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `goal_value` decimal(14,2) DEFAULT NULL,
  `goal_achieved` decimal(14,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `goal_id` (`goal_id`),
  KEY `sale_user_id` (`sale_user_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_sale_goal_user_ibfk_1` FOREIGN KEY (`goal_id`) REFERENCES `app_company_campaign_sale_goal` (`goal_id`),
  CONSTRAINT `app_company_campaign_sale_goal_user_ibfk_2` FOREIGN KEY (`sale_user_id`) REFERENCES `app_company_campaign_sale_user` (`id`),
  CONSTRAINT `app_company_campaign_sale_goal_user_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_sale_goal_user_ibfk_4` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27410 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sale_goal_user_register`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sale_goal_user_register` (
  `register_id` int(11) NOT NULL AUTO_INCREMENT,
  `goal_id` int(11) DEFAULT NULL,
  `sale_user_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `register_value` decimal(14,2) DEFAULT NULL,
  `register_date` datetime DEFAULT NULL,
  PRIMARY KEY (`register_id`),
  KEY `goal_id` (`goal_id`),
  KEY `sale_user_id` (`sale_user_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_sale_goal_user_register_ibfk_1` FOREIGN KEY (`goal_id`) REFERENCES `app_company_campaign_sale_goal` (`goal_id`),
  CONSTRAINT `app_company_campaign_sale_goal_user_register_ibfk_2` FOREIGN KEY (`sale_user_id`) REFERENCES `app_company_campaign_sale_user` (`id`),
  CONSTRAINT `app_company_campaign_sale_goal_user_register_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_sale_goal_user_register_ibfk_4` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23305 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sale_level`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sale_level` (
  `level_id` int(11) NOT NULL AUTO_INCREMENT,
  `level_name` varchar(255) NOT NULL,
  `level_parent_id` int(11) DEFAULT NULL,
  `level_register_sell` int(11) DEFAULT '0',
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`level_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `company_id` (`company_id`),
  KEY `level_parent_id` (`level_parent_id`),
  CONSTRAINT `app_company_campaign_sale_level_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_sale_level_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_sale_level_ibfk_3` FOREIGN KEY (`level_parent_id`) REFERENCES `app_company_campaign_sale_level` (`level_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sale_user`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sale_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `user_parent_id` int(11) DEFAULT NULL,
  `cluster_id` int(11) NOT NULL,
  `level_id` int(11) NOT NULL,
  `sale_desc` varchar(255) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `user_parent_id` (`user_parent_id`),
  KEY `cluster_id` (`cluster_id`),
  KEY `level_id` (`level_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_sale_user_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_sale_user_ibfk_2` FOREIGN KEY (`user_parent_id`) REFERENCES `app_company_campaign_sale_user` (`id`),
  CONSTRAINT `app_company_campaign_sale_user_ibfk_3` FOREIGN KEY (`cluster_id`) REFERENCES `app_company_campaign_sale_cluster` (`cluster_id`),
  CONSTRAINT `app_company_campaign_sale_user_ibfk_4` FOREIGN KEY (`level_id`) REFERENCES `app_company_campaign_sale_level` (`level_id`),
  CONSTRAINT `app_company_campaign_sale_user_ibfk_5` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_sale_user_ibfk_6` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17012 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sell`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sell` (
  `sell_id` int(11) NOT NULL AUTO_INCREMENT,
  `sell_value` float DEFAULT NULL,
  `sell_created` datetime DEFAULT NULL,
  `sell_imported` datetime DEFAULT NULL,
  `sell_protocol` varchar(255) DEFAULT NULL,
  `sell_validator` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`sell_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_campaign_sell_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_sell_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_sell_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9746 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sell_item`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sell_item` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `item_brand` varchar(255) DEFAULT NULL,
  `item_model` varchar(255) DEFAULT NULL,
  `item_category` varchar(255) DEFAULT NULL,
  `item_value` float DEFAULT NULL,
  `sell_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `sell_id` (`sell_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_campaign_sell_item_ibfk_1` FOREIGN KEY (`sell_id`) REFERENCES `app_company_campaign_sell` (`sell_id`),
  CONSTRAINT `app_company_campaign_sell_item_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_sell_item_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_sell_item_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10007 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sellout_booster_distributor_register`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sellout_booster_distributor_register` (
  `item_id` varchar(36) NOT NULL,
  `booster_id` varchar(36) DEFAULT NULL,
  `booster_status` int(11) DEFAULT NULL,
  `booster_accumulated` float DEFAULT NULL,
  `distributor_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `booster_id` (`booster_id`),
  KEY `distributor_id` (`distributor_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_sellout_booster_distributor_register_ibfk_1` FOREIGN KEY (`booster_id`) REFERENCES `app_company_campaign_sellout_cluster_booster` (`booster_id`),
  CONSTRAINT `app_company_campaign_sellout_booster_distributor_register_ibfk_2` FOREIGN KEY (`distributor_id`) REFERENCES `app_company_campaign_sellout_distributor` (`distributor_id`),
  CONSTRAINT `app_company_campaign_sellout_booster_distributor_register_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_sellout_booster_distributor_register_ibfk_4` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sellout_cluster`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sellout_cluster` (
  `cluster_id` varchar(36) NOT NULL,
  `cluster_name` varchar(255) DEFAULT NULL,
  `cluster_status` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`cluster_id`),
  KEY `company_id` (`company_id`),
  KEY `id_fk_cluster` (`campaign_id`),
  CONSTRAINT `app_company_campaign_sellout_cluster_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `id_fk_cluster` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sellout_cluster_booster`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sellout_cluster_booster` (
  `booster_id` varchar(36) NOT NULL,
  `booster_start` datetime DEFAULT NULL,
  `booster_end` datetime DEFAULT NULL,
  `booster_value` float DEFAULT NULL,
  `booster_name` varchar(255) DEFAULT NULL,
  `booster_description` varchar(2000) DEFAULT NULL,
  `booster_type` varchar(255) DEFAULT NULL,
  `booster_activate_value` float DEFAULT NULL,
  `cluster_id` varchar(36) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `cycle_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`booster_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `company_id` (`company_id`),
  KEY `app_company_campaign_sellout_cluster_booster_ibfk_1` (`cluster_id`),
  KEY `fk_cycle_id` (`cycle_id`),
  CONSTRAINT `app_company_campaign_sellout_cluster_booster_ibfk_1` FOREIGN KEY (`cluster_id`) REFERENCES `app_company_campaign_sellout_cluster` (`cluster_id`),
  CONSTRAINT `app_company_campaign_sellout_cluster_booster_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_sellout_cluster_booster_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `fk_cycle_id` FOREIGN KEY (`cycle_id`) REFERENCES `app_company_campaign_sellout_cycle` (`cycle_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sellout_cluster_booster_product`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sellout_cluster_booster_product` (
  `item_id` varchar(36) NOT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `booster_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `product_id` (`product_id`),
  KEY `booster_id` (`booster_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_sellout_cluster_booster_product_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `app_company_campaign_sellout_product` (`product_id`),
  CONSTRAINT `app_company_campaign_sellout_cluster_booster_product_ibfk_2` FOREIGN KEY (`booster_id`) REFERENCES `app_company_campaign_sellout_cluster_booster` (`booster_id`),
  CONSTRAINT `app_company_campaign_sellout_cluster_booster_product_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_sellout_cluster_booster_product_ibfk_4` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sellout_cycle`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sellout_cycle` (
  `cycle_id` varchar(36) NOT NULL,
  `cycle_name` varchar(255) DEFAULT NULL,
  `cycle_status` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `cycle_start` datetime DEFAULT NULL,
  `cycle_end` datetime DEFAULT NULL,
  `cycle_description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`cycle_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_sellout_cycle_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_sellout_cycle_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sellout_cycle_goal`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sellout_cycle_goal` (
  `goal_id` varchar(36) NOT NULL,
  `goal_name` varchar(255) DEFAULT NULL,
  `goal_description` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `cycle_id` varchar(36) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`goal_id`),
  KEY `company_id` (`company_id`),
  KEY `cycle_id` (`cycle_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_sellout_cycle_goal_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_sellout_cycle_goal_ibfk_2` FOREIGN KEY (`cycle_id`) REFERENCES `app_company_campaign_sellout_cycle` (`cycle_id`),
  CONSTRAINT `app_company_campaign_sellout_cycle_goal_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sellout_cycle_goal_distributor`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sellout_cycle_goal_distributor` (
  `item_id` varchar(36) NOT NULL,
  `goal_value` float DEFAULT NULL,
  `distributor_id` varchar(36) DEFAULT NULL,
  `goal_id` varchar(36) DEFAULT NULL,
  `cycle_id` varchar(36) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `distributor_id` (`distributor_id`),
  KEY `goal_id` (`goal_id`),
  KEY `company_id` (`company_id`),
  KEY `cycle_id` (`cycle_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_sellout_cycle_goal_distributor_ibfk_1` FOREIGN KEY (`distributor_id`) REFERENCES `app_company_campaign_sellout_distributor` (`distributor_id`),
  CONSTRAINT `app_company_campaign_sellout_cycle_goal_distributor_ibfk_2` FOREIGN KEY (`goal_id`) REFERENCES `app_company_campaign_sellout_cycle_goal` (`goal_id`),
  CONSTRAINT `app_company_campaign_sellout_cycle_goal_distributor_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_sellout_cycle_goal_distributor_ibfk_4` FOREIGN KEY (`cycle_id`) REFERENCES `app_company_campaign_sellout_cycle` (`cycle_id`),
  CONSTRAINT `app_company_campaign_sellout_cycle_goal_distributor_ibfk_5` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sellout_cycle_goal_product`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sellout_cycle_goal_product` (
  `item_id` varchar(36) NOT NULL,
  `goal_id` varchar(36) NOT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `cycle_id` varchar(36) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `company_id` (`company_id`),
  KEY `cycle_id` (`cycle_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `app_company_campaign_sellout_cycle_goal_product_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_sellout_cycle_goal_product_ibfk_2` FOREIGN KEY (`cycle_id`) REFERENCES `app_company_campaign_sellout_cycle` (`cycle_id`),
  CONSTRAINT `app_company_campaign_sellout_cycle_goal_product_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_sellout_cycle_goal_product_ibfk_4` FOREIGN KEY (`product_id`) REFERENCES `app_company_campaign_sellout_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sellout_distributor`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sellout_distributor` (
  `distributor_id` varchar(36) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `seller_id` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `cluster_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`distributor_id`),
  KEY `company_id` (`company_id`),
  KEY `fk_campaign_id` (`campaign_id`),
  KEY `fk_user_id` (`user_id`),
  KEY `fk_cluster_id` (`cluster_id`),
  CONSTRAINT `app_company_campaign_sellout_distributor_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `fk_campaign_id` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `fk_cluster_id` FOREIGN KEY (`cluster_id`) REFERENCES `app_company_campaign_sellout_cluster` (`cluster_id`),
  CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sellout_distributor_operation`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sellout_distributor_operation` (
  `operation_id` varchar(36) NOT NULL,
  `operation_name` varchar(255) DEFAULT NULL,
  `operation_document` varchar(255) DEFAULT NULL,
  `operation_status` int(11) DEFAULT NULL,
  `operation_external_id` varchar(255) DEFAULT NULL,
  `operation_address` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `distributor_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`operation_id`),
  KEY `distributor_id` (`distributor_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_sellout_distributor_operation_ibfk_1` FOREIGN KEY (`distributor_id`) REFERENCES `app_company_campaign_sellout_distributor` (`distributor_id`),
  CONSTRAINT `app_company_campaign_sellout_distributor_operation_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_sellout_distributor_operation_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sellout_product`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sellout_product` (
  `product_id` varchar(36) NOT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `product_cover` varchar(255) DEFAULT NULL,
  `product_external_id` varchar(255) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `product_category` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_campaign_sellout_product_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_sellout_product_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sellout_register`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sellout_register` (
  `register_id` varchar(36) NOT NULL,
  `register_date` datetime DEFAULT NULL,
  `register_order` varchar(255) DEFAULT NULL,
  `register_value` float DEFAULT NULL,
  `register_description` varchar(255) DEFAULT NULL,
  `distributor_id` varchar(36) DEFAULT NULL,
  `cycle_id` varchar(36) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`register_id`),
  KEY `distributor_id` (`distributor_id`),
  KEY `company_id` (`company_id`),
  KEY `cycle_id` (`cycle_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_sellout_register_ibfk_1` FOREIGN KEY (`distributor_id`) REFERENCES `app_company_campaign_sellout_distributor` (`distributor_id`),
  CONSTRAINT `app_company_campaign_sellout_register_ibfk_4` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_sellout_register_ibfk_5` FOREIGN KEY (`cycle_id`) REFERENCES `app_company_campaign_sellout_cycle` (`cycle_id`),
  CONSTRAINT `app_company_campaign_sellout_register_ibfk_6` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sellout_register_booster`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sellout_register_booster` (
  `item_id` varchar(36) NOT NULL,
  `booster_id` varchar(36) DEFAULT NULL,
  `register_id` varchar(36) DEFAULT NULL,
  `item_description` varchar(255) DEFAULT NULL,
  `item_boosted_value` float DEFAULT NULL,
  `item_original_value` float DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `register_id` (`register_id`),
  KEY `booster_id` (`booster_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_sellout_register_booster_ibfk_1` FOREIGN KEY (`register_id`) REFERENCES `app_company_campaign_sellout_register` (`register_id`),
  CONSTRAINT `app_company_campaign_sellout_register_booster_ibfk_2` FOREIGN KEY (`booster_id`) REFERENCES `app_company_campaign_sellout_cluster_booster` (`booster_id`),
  CONSTRAINT `app_company_campaign_sellout_register_booster_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_sellout_register_booster_ibfk_4` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sellout_register_item`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sellout_register_item` (
  `item_id` varchar(36) NOT NULL,
  `item_value` float DEFAULT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `register_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `goal_id` varchar(36) DEFAULT NULL,
  `item_real_value` float DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `product_id` (`product_id`),
  KEY `register_id` (`register_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `goal_fk` (`goal_id`),
  CONSTRAINT `app_company_campaign_sellout_register_item_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `app_company_campaign_sellout_product` (`product_id`),
  CONSTRAINT `app_company_campaign_sellout_register_item_ibfk_2` FOREIGN KEY (`register_id`) REFERENCES `app_company_campaign_sellout_register` (`register_id`),
  CONSTRAINT `app_company_campaign_sellout_register_item_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_sellout_register_item_ibfk_4` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `goal_fk` FOREIGN KEY (`goal_id`) REFERENCES `app_company_campaign_sellout_cycle_goal` (`goal_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_sellout_seller`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_sellout_seller` (
  `seller_id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`seller_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `app_company_campaign_sellout_seller_ibfk_3` (`user_id`),
  CONSTRAINT `app_company_campaign_sellout_seller_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_sellout_seller_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_sellout_seller_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_ticket`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_ticket` (
  `ticket_id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_value` int(11) DEFAULT NULL,
  `ticket_status` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `ticket_sorted` datetime DEFAULT NULL,
  `ticket_attributed` datetime DEFAULT NULL,
  PRIMARY KEY (`ticket_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_campaign_ticket_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_ticket_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_ticket_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4523401 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_user`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_user` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `item_created` datetime DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_campaign_user_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_user_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_user_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=74413 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_user_node`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_user_node` (
  `node_id` int(11) NOT NULL AUTO_INCREMENT,
  `node_parent` int(11) DEFAULT NULL,
  `node_join` datetime DEFAULT NULL,
  `node_value` int(11) DEFAULT NULL,
  `node_sell` float DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`node_id`),
  KEY `node_parent` (`node_parent`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_campaign_user_node_ibfk_1` FOREIGN KEY (`node_parent`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_user_node_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_user_node_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_user_node_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1261 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_vsale_actor_boosters`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_vsale_actor_boosters` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `booster_id` int(11) DEFAULT NULL,
  `actor_id` int(11) DEFAULT NULL,
  `booster_items` float DEFAULT NULL,
  `booster_points` float DEFAULT NULL,
  `booster_notes` text,
  `booster_user_break_value` int(11) DEFAULT NULL,
  `booster_user_value` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `booster_id` (`booster_id`),
  KEY `actor_id` (`actor_id`),
  CONSTRAINT `app_company_campaign_vsale_actor_boosters_ibfk_1` FOREIGN KEY (`booster_id`) REFERENCES `app_company_campaign_vsale_boosters` (`booster_id`),
  CONSTRAINT `app_company_campaign_vsale_actor_boosters_ibfk_2` FOREIGN KEY (`actor_id`) REFERENCES `app_company_campaign_vsale_actors` (`actor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11035 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_vsale_actor_goals`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_vsale_actor_goals` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `goal_id` int(11) DEFAULT NULL,
  `goal_value` decimal(14,2) DEFAULT NULL,
  `goal_achieved` decimal(14,2) DEFAULT NULL,
  `goal_points` decimal(14,2) DEFAULT NULL,
  `actor_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `goal_id` (`goal_id`),
  KEY `actor_id` (`actor_id`),
  CONSTRAINT `app_company_campaign_vsale_actor_goals_ibfk_1` FOREIGN KEY (`goal_id`) REFERENCES `app_company_campaign_vsale_goals` (`goal_id`),
  CONSTRAINT `app_company_campaign_vsale_actor_goals_ibfk_2` FOREIGN KEY (`actor_id`) REFERENCES `app_company_campaign_vsale_actors` (`actor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6089 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_vsale_actor_penals`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_vsale_actor_penals` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `penal_id` int(11) DEFAULT NULL,
  `actor_id` int(11) DEFAULT NULL,
  `penal_items` float DEFAULT NULL,
  `penal_points` float DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `penal_id` (`penal_id`),
  KEY `actor_id` (`actor_id`),
  CONSTRAINT `app_company_campaign_vsale_actor_penals_ibfk_1` FOREIGN KEY (`penal_id`) REFERENCES `app_company_campaign_vsale_penals` (`penal_id`),
  CONSTRAINT `app_company_campaign_vsale_actor_penals_ibfk_2` FOREIGN KEY (`actor_id`) REFERENCES `app_company_campaign_vsale_actors` (`actor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2241 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_vsale_actors`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_vsale_actors` (
  `actor_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `cluster_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`actor_id`),
  KEY `user_id` (`user_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `cluster_id` (`cluster_id`),
  CONSTRAINT `app_company_campaign_vsale_actors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campaign_vsale_actors_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_vsale_actors_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_vsale_actors_ibfk_4` FOREIGN KEY (`cluster_id`) REFERENCES `app_company_campaign_vsale_clusters` (`cluster_id`)
) ENGINE=InnoDB AUTO_INCREMENT=800 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_vsale_boosters`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_vsale_boosters` (
  `booster_id` int(11) NOT NULL AUTO_INCREMENT,
  `booster_name` varchar(255) DEFAULT NULL,
  `booster_description` text,
  `booster_start_date` date DEFAULT NULL,
  `booster_end_date` date DEFAULT NULL,
  `booster_type` varchar(255) DEFAULT 'input',
  `booster_points` float DEFAULT NULL,
  `booster_points_max` float DEFAULT NULL,
  `booster_unique` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `cycle_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`booster_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `cycle_id` (`cycle_id`),
  CONSTRAINT `app_company_campaign_vsale_boosters_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_vsale_boosters_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_vsale_boosters_ibfk_3` FOREIGN KEY (`cycle_id`) REFERENCES `app_company_campaign_vsale_cycles` (`cycle_id`)
) ENGINE=InnoDB AUTO_INCREMENT=168 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_vsale_clusters`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_vsale_clusters` (
  `cluster_id` int(11) NOT NULL AUTO_INCREMENT,
  `cluster_name` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`cluster_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_vsale_clusters_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_vsale_clusters_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_vsale_configs`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_vsale_configs` (
  `config_id` int(11) NOT NULL AUTO_INCREMENT,
  `config_decimals` int(11) DEFAULT '0',
  `config_points_rule` enum('round','ceil','floor') DEFAULT 'round',
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`config_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_vsale_configs_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_vsale_configs_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_vsale_cycles`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_vsale_cycles` (
  `cycle_id` int(11) NOT NULL AUTO_INCREMENT,
  `cycle_name` varchar(255) DEFAULT NULL,
  `cycle_start_date` date DEFAULT NULL,
  `cycle_end_date` date DEFAULT NULL,
  `cycle_global_ranking` int(11) DEFAULT '0',
  `cycle_by_month` int(11) DEFAULT '1',
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `cycle_ranking` int(11) DEFAULT '1',
  PRIMARY KEY (`cycle_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_vsale_cycles_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_vsale_cycles_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_vsale_goals`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_vsale_goals` (
  `goal_id` int(11) NOT NULL AUTO_INCREMENT,
  `goal_name` varchar(255) DEFAULT NULL,
  `goal_description` text,
  `goal_start_date` date DEFAULT NULL,
  `goal_end_date` date DEFAULT NULL,
  `goal_sum_progress` int(11) NOT NULL DEFAULT '1',
  `goal_break` float DEFAULT NULL,
  `goal_break_points` float DEFAULT NULL,
  `goal_points_start_break` int(11) DEFAULT '1',
  `goal_points_sum` float DEFAULT '0',
  `goal_points_float_steps` float DEFAULT '0',
  `goal_points_max` float DEFAULT NULL,
  `goal_elegible` int(11) DEFAULT NULL,
  `cycle_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`goal_id`),
  KEY `cycle_id` (`cycle_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `app_company_campaign_vsale_goals_ibfk_1` FOREIGN KEY (`cycle_id`) REFERENCES `app_company_campaign_vsale_cycles` (`cycle_id`),
  CONSTRAINT `app_company_campaign_vsale_goals_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_vsale_goals_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_vsale_location_register`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_vsale_location_register` (
  `register_id` int(11) NOT NULL AUTO_INCREMENT,
  `register_points` int(11) DEFAULT NULL,
  `register_created` datetime DEFAULT NULL,
  `booster_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`register_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `location_id` (`location_id`),
  KEY `booster_id` (`booster_id`),
  CONSTRAINT `app_company_campaign_vsale_location_register_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_vsale_location_register_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_vsale_location_register_ibfk_3` FOREIGN KEY (`location_id`) REFERENCES `app_company_campaign_vsale_locations` (`location_id`),
  CONSTRAINT `app_company_campaign_vsale_location_register_ibfk_4` FOREIGN KEY (`booster_id`) REFERENCES `app_company_campaign_vsale_boosters` (`booster_id`)
) ENGINE=InnoDB AUTO_INCREMENT=298 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_vsale_locations`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_vsale_locations` (
  `location_id` int(11) NOT NULL AUTO_INCREMENT,
  `location_name` varchar(255) DEFAULT NULL,
  `location_address` varchar(255) DEFAULT NULL,
  `location_neighborhood` varchar(255) DEFAULT NULL,
  `location_city` varchar(255) DEFAULT NULL,
  `location_state` varchar(255) DEFAULT NULL,
  `location_zipcode` varchar(255) DEFAULT NULL,
  `location_latitude` double DEFAULT NULL,
  `location_longitude` double DEFAULT NULL,
  `actor_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`location_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `actor_id` (`actor_id`),
  CONSTRAINT `app_company_campaign_vsale_locations_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_vsale_locations_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_vsale_locations_ibfk_3` FOREIGN KEY (`actor_id`) REFERENCES `app_company_campaign_vsale_actors` (`actor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1488 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_vsale_penals`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_vsale_penals` (
  `penal_id` int(11) NOT NULL AUTO_INCREMENT,
  `penal_name` varchar(255) DEFAULT NULL,
  `penal_description` text,
  `penal_start_date` date DEFAULT NULL,
  `penal_end_date` date DEFAULT NULL,
  `penal_points` float DEFAULT NULL,
  `penal_unique` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `cycle_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`penal_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `cycle_id` (`cycle_id`),
  CONSTRAINT `app_company_campaign_vsale_penals_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_vsale_penals_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_vsale_penals_ibfk_3` FOREIGN KEY (`cycle_id`) REFERENCES `app_company_campaign_vsale_cycles` (`cycle_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_vsale_raffle_clusters`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_vsale_raffle_clusters` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) NOT NULL,
  `campaign_id` int(11) NOT NULL,
  `raffle_id` int(11) NOT NULL,
  `cluster_id` int(11) NOT NULL,
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_vsale_raffle_credits`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_vsale_raffle_credits` (
  `credit_id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) NOT NULL,
  `campaign_id` int(11) NOT NULL,
  `raffle_id` int(11) NOT NULL,
  `actor_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `credit_quantity` int(11) NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`credit_id`),
  UNIQUE KEY `uk_raffle_actor` (`raffle_id`,`actor_id`),
  KEY `idx_raffle` (`raffle_id`),
  KEY `idx_actor` (`actor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=337 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_vsale_raffle_prizes`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_vsale_raffle_prizes` (
  `prize_id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) NOT NULL,
  `campaign_id` int(11) NOT NULL,
  `raffle_id` int(11) NOT NULL,
  `prize_order` int(11) NOT NULL,
  `prize_name` varchar(255) NOT NULL,
  `prize_description` text,
  `prize_image` varchar(500) DEFAULT NULL,
  `winner_ticket_id` int(11) DEFAULT NULL,
  `winner_actor_id` int(11) DEFAULT NULL,
  `winner_user_id` int(11) DEFAULT NULL,
  `winner_ticket_number` varchar(20) DEFAULT NULL,
  `prize_drawn_at` datetime DEFAULT NULL,
  PRIMARY KEY (`prize_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_vsale_raffle_tickets`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_vsale_raffle_tickets` (
  `ticket_id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) NOT NULL,
  `campaign_id` int(11) NOT NULL,
  `raffle_id` int(11) NOT NULL,
  `actor_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `ticket_number` varchar(20) NOT NULL,
  `ticket_locked` tinyint(4) DEFAULT '0',
  `ticket_created` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ticket_id`),
  KEY `idx_raffle_ticket_number` (`raffle_id`,`ticket_number`)
) ENGINE=InnoDB AUTO_INCREMENT=849 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_vsale_raffles`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_vsale_raffles` (
  `raffle_id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) NOT NULL,
  `campaign_id` int(11) NOT NULL,
  `raffle_name` varchar(255) NOT NULL,
  `raffle_description` text,
  `raffle_regulation` text,
  `raffle_start_date` date NOT NULL,
  `raffle_end_date` date NOT NULL,
  `raffle_total_tickets` int(11) NOT NULL DEFAULT '0',
  `raffle_lock_type` varchar(50) DEFAULT 'none',
  `raffle_lock_value` decimal(10,2) DEFAULT '0.00',
  `raffle_lock_cycle_id` int(11) DEFAULT NULL,
  `raffle_draw_type` varchar(10) DEFAULT 'random',
  `raffle_federal_number` varchar(6) DEFAULT NULL,
  `raffle_disclaimer_accepted` tinyint(1) DEFAULT '0',
  `raffle_disclaimer_accepted_by` int(11) DEFAULT NULL,
  `raffle_disclaimer_accepted_at` datetime DEFAULT NULL,
  `raffle_drawn_at` datetime DEFAULT NULL,
  `raffle_drawn_by` int(11) DEFAULT NULL,
  `raffle_status` tinyint(4) DEFAULT '1',
  `raffle_created` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`raffle_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campaign_vsale_upload_register`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campaign_vsale_upload_register` (
  `register_id` int(11) NOT NULL AUTO_INCREMENT,
  `register_file` varchar(255) DEFAULT NULL,
  `register_content` text,
  `register_created` datetime DEFAULT NULL,
  `register_status` int(11) DEFAULT NULL,
  `register_message` text,
  `register_points` int(11) DEFAULT NULL,
  `booster_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `actor_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`register_id`),
  KEY `company_id` (`company_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `actor_id` (`actor_id`),
  KEY `booster_id` (`booster_id`),
  CONSTRAINT `app_company_campaign_vsale_upload_register_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campaign_vsale_upload_register_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `app_company_campaign` (`campaign_id`),
  CONSTRAINT `app_company_campaign_vsale_upload_register_ibfk_3` FOREIGN KEY (`actor_id`) REFERENCES `app_company_campaign_vsale_actors` (`actor_id`),
  CONSTRAINT `app_company_campaign_vsale_upload_register_ibfk_4` FOREIGN KEY (`booster_id`) REFERENCES `app_company_campaign_vsale_boosters` (`booster_id`)
) ENGINE=InnoDB AUTO_INCREMENT=148 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campus_course`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campus_course` (
  `course_uuid` varchar(255) NOT NULL,
  `course_id` int(10) NOT NULL AUTO_INCREMENT,
  `course_title` varchar(255) NOT NULL,
  `course_thumbnail` varchar(1000) DEFAULT NULL,
  `course_description` varchar(10000) DEFAULT NULL,
  `course_status` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `course_moodle` varchar(255) DEFAULT NULL,
  `course_order` int(11) DEFAULT '0',
  PRIMARY KEY (`course_id`),
  KEY `app_company_campus_course_ibfk_1` (`company_id`),
  KEY `app_company_campus_course_ibfk_2` (`user_id`),
  CONSTRAINT `app_company_campus_course_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campus_course_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=155 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campus_course_certificate`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campus_course_certificate` (
  `certificate_id` varchar(36) NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `certificate_html` longtext,
  `created_at` datetime DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`certificate_id`),
  KEY `company_id` (`company_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `app_company_campus_course_certificate_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campus_course_certificate_ibfk_3` FOREIGN KEY (`course_id`) REFERENCES `app_company_campus_course` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campus_course_certificate_user`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campus_course_certificate_user` (
  `item_id` varchar(36) NOT NULL,
  `certificate_id` varchar(36) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `certificate_html` longtext,
  `created_at` datetime DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  KEY `certificate_id` (`certificate_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `app_company_campus_course_certificate_user_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campus_course_certificate_user_ibfk_4` FOREIGN KEY (`certificate_id`) REFERENCES `app_company_campus_course_certificate` (`certificate_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campus_course_certificate_user_ibfk_5` FOREIGN KEY (`course_id`) REFERENCES `app_company_campus_course` (`course_id`) ON DELETE CASCADE,
  CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campus_course_group`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campus_course_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  KEY `app_company_campus_course_group_ibfk_1` (`course_id`),
  KEY `app_company_campus_course_group_ibfk_2` (`group_id`),
  CONSTRAINT `app_company_campus_course_group_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `app_company_campus_course` (`course_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campus_course_group_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `app_company_group` (`group_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campus_course_group_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=447 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campus_lesson`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campus_lesson` (
  `lesson_id` int(11) NOT NULL AUTO_INCREMENT,
  `lesson_uuid` varchar(255) NOT NULL,
  `lesson_title` varchar(255) NOT NULL,
  `lesson_description` varchar(10000) DEFAULT NULL,
  `lesson_status` int(11) NOT NULL,
  `lesson_video` varchar(255) DEFAULT NULL,
  `lesson_minimal_time` int(11) DEFAULT NULL,
  `lesson_mandatory` int(11) NOT NULL,
  `module_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `lesson_duration_time` int(11) DEFAULT NULL,
  `lesson_thumbnail` varchar(1000) DEFAULT NULL,
  `lesson_content` varchar(10000) DEFAULT NULL,
  PRIMARY KEY (`lesson_id`),
  KEY `company_id` (`company_id`),
  KEY `app_company_campus_lesson_ibfk_1` (`module_id`),
  KEY `app_company_campus_lesson_ibfk_3` (`user_id`),
  CONSTRAINT `app_company_campus_lesson_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `app_company_campus_module` (`module_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campus_lesson_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campus_lesson_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=785 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campus_lesson_file`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campus_lesson_file` (
  `file_id` varchar(36) NOT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `lesson_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`file_id`),
  KEY `company_id` (`company_id`),
  KEY `lesson_id` (`lesson_id`),
  CONSTRAINT `app_company_campus_lesson_file_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campus_lesson_file_ibfk_3` FOREIGN KEY (`lesson_id`) REFERENCES `app_company_campus_lesson` (`lesson_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campus_lesson_view`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campus_lesson_view` (
  `view_id` int(11) NOT NULL AUTO_INCREMENT,
  `view_views` int(11) DEFAULT NULL,
  `view_finish` int(11) DEFAULT NULL,
  `view_finish_date` datetime DEFAULT NULL,
  `lesson_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `view_duration_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`view_id`),
  KEY `user_id` (`user_id`),
  KEY `app_company_campus_lesson_view_ibfk_1` (`lesson_id`),
  CONSTRAINT `app_company_campus_lesson_view_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `app_company_campus_lesson` (`lesson_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campus_lesson_view_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=39403 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campus_module`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campus_module` (
  `module_id` int(11) NOT NULL AUTO_INCREMENT,
  `module_uuid` varchar(255) NOT NULL,
  `module_title` varchar(255) NOT NULL,
  `module_description` varchar(10000) DEFAULT NULL,
  `module_status` int(11) NOT NULL,
  `module_mandatory` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `module_duration_time` int(11) DEFAULT NULL,
  `module_order` int(11) DEFAULT NULL,
  PRIMARY KEY (`module_id`),
  KEY `company_id` (`company_id`),
  KEY `app_company_campus_module_ibfk_1` (`course_id`),
  CONSTRAINT `app_company_campus_module_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `app_company_campus_course` (`course_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campus_module_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=386 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campus_module_quiz`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campus_module_quiz` (
  `quiz_id` varchar(36) NOT NULL,
  `quiz_name` varchar(255) DEFAULT NULL,
  `quiz_status` int(11) DEFAULT NULL,
  `module_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `quiz_max_time` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`quiz_id`),
  KEY `id_fk_company` (`company_id`),
  KEY `app_company_campus_module_quiz_ibfk_1` (`module_id`),
  CONSTRAINT `app_company_campus_module_quiz_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `app_company_campus_module` (`module_id`) ON DELETE CASCADE,
  CONSTRAINT `id_fk_company` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campus_module_quiz_answer`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campus_module_quiz_answer` (
  `answer_id` varchar(36) NOT NULL,
  `answer_correct` int(11) DEFAULT NULL,
  `question_id` varchar(36) DEFAULT NULL,
  `option_id` varchar(36) DEFAULT NULL,
  `quiz_id` varchar(36) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `answer_text` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`answer_id`),
  KEY `app_company_campus_module_quiz_answer_ibfk_1` (`question_id`),
  KEY `app_company_campus_module_quiz_answer_ibfk_2` (`option_id`),
  KEY `app_company_campus_module_quiz_answer_ibfk_3` (`quiz_id`),
  KEY `app_company_campus_module_quiz_answer_ibfk_4` (`user_id`),
  KEY `app_company_campus_module_quiz_answer_ibfk_5` (`company_id`),
  CONSTRAINT `app_company_campus_module_quiz_answer_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `app_company_campus_module_quiz_question` (`question_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campus_module_quiz_answer_ibfk_2` FOREIGN KEY (`option_id`) REFERENCES `app_company_campus_module_quiz_question_option` (`option_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campus_module_quiz_answer_ibfk_3` FOREIGN KEY (`quiz_id`) REFERENCES `app_company_campus_module_quiz` (`quiz_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campus_module_quiz_answer_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campus_module_quiz_answer_ibfk_5` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campus_module_quiz_question`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campus_module_quiz_question` (
  `question_id` varchar(36) NOT NULL,
  `question_text` varchar(255) DEFAULT NULL,
  `question_status` int(11) DEFAULT NULL,
  `question_type` varchar(255) DEFAULT NULL,
  `quiz_id` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `question_index` int(11) DEFAULT NULL,
  PRIMARY KEY (`question_id`),
  KEY `id_fk_company_1` (`company_id`),
  KEY `app_company_campus_module_quiz_question_ibfk_1` (`quiz_id`),
  CONSTRAINT `app_company_campus_module_quiz_question_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `app_company_campus_module_quiz` (`quiz_id`) ON DELETE CASCADE,
  CONSTRAINT `id_fk_company_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campus_module_quiz_question_option`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campus_module_quiz_question_option` (
  `option_id` varchar(36) NOT NULL,
  `option_text` varchar(255) DEFAULT NULL,
  `option_status` int(11) DEFAULT NULL,
  `question_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `option_answer` int(11) DEFAULT NULL,
  PRIMARY KEY (`option_id`),
  KEY `id_fk_company_2` (`company_id`),
  KEY `app_company_campus_module_quiz_question_option_ibfk_1` (`question_id`),
  CONSTRAINT `app_company_campus_module_quiz_question_option_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `app_company_campus_module_quiz_question` (`question_id`) ON DELETE CASCADE,
  CONSTRAINT `id_fk_company_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campus_module_quiz_session`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campus_module_quiz_session` (
  `session_id` varchar(36) NOT NULL,
  `quiz_id` varchar(36) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`session_id`),
  KEY `user_id` (`user_id`),
  KEY `app_company_campus_module_quiz_session_ibfk_1` (`quiz_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_campus_module_quiz_session_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `app_company_campus_module_quiz` (`quiz_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_campus_module_quiz_session_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campus_module_quiz_session_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_campus_quiz_answer_result`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_campus_quiz_answer_result` (
  `result_id` varchar(36) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `quiz_id` varchar(36) DEFAULT NULL,
  `result_score` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`result_id`),
  KEY `user_id` (`user_id`),
  KEY `company_id` (`company_id`),
  KEY `quiz_id` (`quiz_id`),
  CONSTRAINT `app_company_campus_quiz_answer_result_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_campus_quiz_answer_result_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_campus_quiz_answer_result_ibfk_4` FOREIGN KEY (`quiz_id`) REFERENCES `app_company_campus_module_quiz` (`quiz_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_channel`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_channel` (
  `channel_id` int(11) NOT NULL AUTO_INCREMENT,
  `channel_uuid` varchar(255) DEFAULT NULL,
  `channel_created` datetime DEFAULT NULL,
  `channel_name` varchar(255) DEFAULT NULL,
  `channel_avatar` varchar(255) DEFAULT NULL,
  `channel_description` text,
  `channel_private` int(11) DEFAULT NULL,
  `channel_key` varchar(255) DEFAULT NULL,
  `channel_enable_messages` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`channel_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_channel_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_channel_message`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_channel_message` (
  `message_id` int(11) NOT NULL AUTO_INCREMENT,
  `message_uuid` varchar(255) DEFAULT NULL,
  `message_content` text,
  `message_created` datetime DEFAULT NULL,
  `message_author` int(11) DEFAULT NULL,
  `channel_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`message_id`),
  KEY `company_id` (`company_id`),
  KEY `channel_id` (`channel_id`),
  KEY `message_author` (`message_author`),
  CONSTRAINT `app_company_channel_message_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_channel_message_ibfk_2` FOREIGN KEY (`channel_id`) REFERENCES `app_company_channel` (`channel_id`),
  CONSTRAINT `app_company_channel_message_ibfk_3` FOREIGN KEY (`message_author`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_channel_user`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_channel_user` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `item_created` datetime DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `channel_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `company_id` (`company_id`),
  KEY `channel_id` (`channel_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_channel_user_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_channel_user_ibfk_2` FOREIGN KEY (`channel_id`) REFERENCES `app_company_channel` (`channel_id`),
  CONSTRAINT `app_company_channel_user_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=202 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_chat`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_chat` (
  `chat_id` int(11) NOT NULL AUTO_INCREMENT,
  `chat_uuid` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `user_a` int(11) DEFAULT NULL,
  `user_b` int(11) DEFAULT NULL,
  PRIMARY KEY (`chat_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_chat_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_chat_message`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_chat_message` (
  `message_id` int(11) NOT NULL AUTO_INCREMENT,
  `message_uuid` varchar(255) DEFAULT NULL,
  `message_content` text,
  `message_created` datetime DEFAULT NULL,
  `message_author` int(11) DEFAULT NULL,
  `message_view` datetime DEFAULT NULL,
  `chat_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`message_id`),
  KEY `company_id` (`company_id`),
  KEY `chat_id` (`chat_id`),
  CONSTRAINT `app_company_chat_message_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_chat_message_ibfk_2` FOREIGN KEY (`chat_id`) REFERENCES `app_company_chat` (`chat_id`)
) ENGINE=InnoDB AUTO_INCREMENT=248 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_coin`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_coin` (
  `coin_id` varchar(36) NOT NULL,
  `coin_name` varchar(255) DEFAULT NULL,
  `coin_icon` varchar(1000) DEFAULT NULL,
  `coin_exchange` float DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`coin_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_coin_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_department`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_department` (
  `department_id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) DEFAULT NULL,
  `department_name` varchar(255) DEFAULT NULL,
  `department_slug` varchar(255) DEFAULT NULL,
  `department_order` int(11) DEFAULT NULL,
  PRIMARY KEY (`department_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_department_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_dictionary_term`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_dictionary_term` (
  `term_id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) DEFAULT NULL,
  `term_key` varchar(255) DEFAULT NULL,
  `term_text` varchar(255) DEFAULT NULL,
  `language_slug` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`term_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_dictionary_term_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1597 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_discount_store_groups`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_discount_store_groups` (
  `item_id` varchar(36) NOT NULL,
  `store_id` varchar(36) NOT NULL,
  `group_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `store_id` (`store_id`),
  KEY `company_id` (`company_id`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `app_company_discount_store_groups_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `app_company_campaign_discount_store` (`store_id`),
  CONSTRAINT `app_company_discount_store_groups_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_discount_store_groups_ibfk_4` FOREIGN KEY (`group_id`) REFERENCES `app_company_group` (`group_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_email_month`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_email_month` (
  `month_id` int(11) NOT NULL AUTO_INCREMENT,
  `month_month` int(11) DEFAULT NULL,
  `month_year` int(11) DEFAULT NULL,
  `month_limit` int(11) DEFAULT '0',
  `month_sended` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`month_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_email_month_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_event_users`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_event_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `event_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `event_id` (`event_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_event_users_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_event_users_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `app_company_events` (`event_id`),
  CONSTRAINT `app_company_event_users_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=243 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_events`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_events` (
  `event_id` int(11) NOT NULL AUTO_INCREMENT,
  `event_name` varchar(255) DEFAULT NULL,
  `event_cover` varchar(255) DEFAULT NULL,
  `event_description` text,
  `event_created` datetime DEFAULT NULL,
  `event_status` int(11) DEFAULT NULL,
  `event_room_places` int(11) DEFAULT NULL,
  `event_room_gender` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_events_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_events_rooms`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_events_rooms` (
  `room_id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `room_name` varchar(100) DEFAULT NULL,
  `room_places_occupied` int(11) DEFAULT '1',
  `room_created` datetime DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`room_id`),
  KEY `event_id` (`event_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_events_rooms_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `app_company_events` (`event_id`),
  CONSTRAINT `app_company_events_rooms_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=142 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_events_rooms_invites`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_events_rooms_invites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invite_status` int(11) DEFAULT NULL,
  `invite_created` datetime DEFAULT NULL,
  `invite_updated` datetime DEFAULT NULL,
  `invite_response_message` text,
  `user_owner` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `event_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_invite` (`room_id`,`user_id`),
  KEY `user_id` (`user_id`),
  KEY `event_id` (`event_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_events_rooms_invites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_events_rooms_invites_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `app_company_events_rooms` (`room_id`),
  CONSTRAINT `app_company_events_rooms_invites_ibfk_3` FOREIGN KEY (`event_id`) REFERENCES `app_company_events` (`event_id`),
  CONSTRAINT `app_company_events_rooms_invites_ibfk_4` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=234 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_gamification_default_value`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_gamification_default_value` (
  `value_id` varchar(36) NOT NULL,
  `value_module` varchar(255) DEFAULT NULL,
  `value_points` int(11) DEFAULT NULL,
  `value_points_expires` int(11) DEFAULT NULL,
  `value_coins` int(11) DEFAULT NULL,
  `value_coins_expires` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`value_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_gamification_default_value_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_gamification_mgm`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_gamification_mgm` (
  `mgm_id` varchar(36) NOT NULL,
  `mgm_status` int(11) DEFAULT NULL,
  `mgm_lp` varchar(255) DEFAULT NULL,
  `mgm_user_param` varchar(36) DEFAULT NULL,
  `mgm_points` int(11) DEFAULT NULL,
  `mgm_points_expires` int(11) DEFAULT NULL,
  `mgm_coins` int(11) DEFAULT NULL,
  `mgm_coins_expires` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`mgm_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_gamification_mgm_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_gamification_mgm_user_code`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_gamification_mgm_user_code` (
  `code_id` varchar(36) NOT NULL,
  `code_code` varchar(36) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`code_id`),
  KEY `user_id` (`user_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_gamification_mgm_user_code_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_gamification_mgm_user_code_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_gamification_module`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_gamification_module` (
  `item_id` varchar(36) NOT NULL,
  `module_name` varchar(100) DEFAULT NULL,
  `module_points_value` float DEFAULT NULL,
  `module_points_expire` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `module_coins_value` float DEFAULT NULL,
  `module_coins_expire` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_gamification_module_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_giftty_store`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_giftty_store` (
  `assign_id` int(11) NOT NULL AUTO_INCREMENT,
  `assign_public_id` varchar(36) NOT NULL,
  `product_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`assign_id`),
  UNIQUE KEY `assign_public_id` (`assign_public_id`),
  UNIQUE KEY `uq_company_product` (`company_id`,`product_id`),
  KEY `idx_product` (`product_id`),
  KEY `idx_company` (`company_id`),
  CONSTRAINT `app_company_giftty_store_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `app_giftty_products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_giftty_store_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_group`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_group` (
  `group_id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) DEFAULT NULL,
  `group_name` varchar(255) DEFAULT NULL,
  `group_slug` varchar(255) DEFAULT NULL,
  `group_order` int(11) DEFAULT NULL,
  PRIMARY KEY (`group_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_group_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=238 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_kanban_stages`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_kanban_stages` (
  `stage_id` varchar(36) NOT NULL,
  `stage_name` varchar(100) DEFAULT NULL,
  `stage_order` int(11) DEFAULT NULL,
  `stage_status` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`stage_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_kanban_stages_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_landing_pages`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_landing_pages` (
  `page_id` varchar(36) NOT NULL,
  `page_title` varchar(255) NOT NULL,
  `page_slug` varchar(255) DEFAULT NULL,
  `page_body` varchar(10000) NOT NULL,
  `page_footer` varchar(255) DEFAULT NULL,
  `page_youtube_video_url` varchar(255) DEFAULT NULL,
  `page_status` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `page_banner` varchar(1000) DEFAULT NULL,
  `page_content_background` varchar(255) DEFAULT NULL,
  `page_form_background` varchar(255) DEFAULT NULL,
  `page_button_background` varchar(255) DEFAULT NULL,
  `page_button_text` varchar(255) DEFAULT NULL,
  `page_header_text` varchar(255) DEFAULT NULL,
  `page_body_text` varchar(255) DEFAULT NULL,
  `page_video_orientation` varchar(255) DEFAULT NULL,
  `page_banner_mobile` varchar(255) DEFAULT NULL,
  `page_footer_mobile` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`page_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_landing_pages_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_landing_pages_leads`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_landing_pages_leads` (
  `lead_id` varchar(36) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `page_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`lead_id`),
  KEY `page_id` (`page_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_landing_pages_leads_ibfk_2` FOREIGN KEY (`page_id`) REFERENCES `app_company_landing_pages` (`page_id`),
  CONSTRAINT `app_company_landing_pages_leads_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_landing_pages_leads_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_landing_pages_media`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_landing_pages_media` (
  `media_id` varchar(36) NOT NULL,
  `page_id` varchar(36) NOT NULL,
  `company_id` int(11) NOT NULL,
  `media_type` enum('banner','footer') NOT NULL COMMENT 'Tipo: banner ou footer',
  `media_desktop` varchar(500) DEFAULT NULL COMMENT 'URL imagem desktop',
  `media_mobile` varchar(500) DEFAULT NULL COMMENT 'URL imagem mobile',
  `media_start_date` datetime DEFAULT NULL COMMENT 'Data inicio programacao (NULL = sempre ativo)',
  `media_end_date` datetime DEFAULT NULL COMMENT 'Data fim programacao (NULL = sempre ativo)',
  `media_order` int(11) NOT NULL DEFAULT '0' COMMENT 'Ordem de exibicao',
  `media_link` varchar(500) DEFAULT NULL COMMENT 'Link opcional',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`media_id`),
  KEY `page_id` (`page_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_landing_pages_media_ibfk_1` FOREIGN KEY (`page_id`) REFERENCES `app_company_landing_pages` (`page_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_landing_pages_media_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_language`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_language` (
  `language_id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) DEFAULT NULL,
  `language_default` int(11) DEFAULT NULL,
  `language_slug` varchar(10) DEFAULT NULL,
  `language_status` int(11) DEFAULT NULL,
  PRIMARY KEY (`language_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_language_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_level`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_level` (
  `level_id` varchar(36) NOT NULL,
  `level_name` varchar(255) DEFAULT NULL,
  `level_flag` varchar(255) DEFAULT NULL,
  `level_points` int(11) DEFAULT NULL,
  `level_description` text,
  `company_id` int(11) DEFAULT NULL,
  `level_order` int(11) DEFAULT NULL,
  PRIMARY KEY (`level_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_level_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_notification`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_notification` (
  `notification_id` varchar(36) NOT NULL,
  `notification_created` datetime DEFAULT NULL,
  `notification_send_date` datetime DEFAULT NULL,
  `notification_admin_title` varchar(255) DEFAULT NULL,
  `notification_title` varchar(255) DEFAULT NULL,
  `notification_content` text,
  `notification_email` int(11) DEFAULT NULL,
  `notification_global` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `notification_type` varchar(255) DEFAULT NULL,
  `notification_link` varchar(255) DEFAULT NULL,
  `notification_name` varchar(255) DEFAULT NULL,
  `notification_subtitle` varchar(255) DEFAULT NULL,
  `notification_send` int(11) DEFAULT NULL,
  `notification_recurring` int(11) DEFAULT NULL,
  PRIMARY KEY (`notification_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_notification_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_notification_department_item`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_notification_department_item` (
  `item_id` varchar(36) NOT NULL,
  `notification_id` varchar(36) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `notification_id` (`notification_id`),
  KEY `department_id` (`department_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_notification_department_item_ibfk_1` FOREIGN KEY (`notification_id`) REFERENCES `app_company_notification` (`notification_id`),
  CONSTRAINT `app_company_notification_department_item_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `app_company_department` (`department_id`),
  CONSTRAINT `app_company_notification_department_item_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_notification_user`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_notification_user` (
  `item_id` varchar(36) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `notification_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `notification_viewed` int(11) DEFAULT NULL,
  `notification_viewed_date` datetime DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `user_id` (`user_id`),
  KEY `company_id` (`company_id`),
  KEY `notification_id` (`notification_id`),
  CONSTRAINT `app_company_notification_user_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_notification_user_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_notification_user_ibfk_4` FOREIGN KEY (`notification_id`) REFERENCES `app_company_notification` (`notification_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_partner_key`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_partner_key` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) NOT NULL,
  `partner_key` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `partner_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_partner_key_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_post`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_post` (
  `post_id` int(11) NOT NULL AUTO_INCREMENT,
  `post_uuid` varchar(255) DEFAULT NULL,
  `post_created_at` datetime DEFAULT NULL,
  `post_scheduled` datetime DEFAULT NULL,
  `post_content` text,
  `post_status` int(11) DEFAULT NULL,
  `post_archive_motive` text,
  `post_likes` int(11) DEFAULT NULL,
  `post_evaluation` float DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `post_disable_comments` int(11) DEFAULT '0',
  `post_disable_reactions` int(11) DEFAULT '0',
  `post_youtube` varchar(255) DEFAULT NULL,
  `post_fixed` int(11) DEFAULT NULL,
  PRIMARY KEY (`post_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_post_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_post_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1152 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_post_comment`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_post_comment` (
  `comment_id` int(11) NOT NULL AUTO_INCREMENT,
  `comment_uuid` varchar(255) DEFAULT NULL,
  `comment_parent` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `post_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `comment_content` text,
  `comment_created` datetime DEFAULT NULL,
  `comment_archived` int(11) DEFAULT NULL,
  `comment_reactions` int(11) DEFAULT NULL,
  `comment_updated` datetime DEFAULT NULL,
  PRIMARY KEY (`comment_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `app_company_post_comment_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_post_comment_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_post_comment_ibfk_3` FOREIGN KEY (`post_id`) REFERENCES `app_company_post` (`post_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2742 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_post_evaluation`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_post_evaluation` (
  `evaluation_id` int(11) NOT NULL AUTO_INCREMENT,
  `evaluation_created_at` datetime DEFAULT NULL,
  `evaluation_value` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `post_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`evaluation_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `app_company_post_evaluation_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_post_evaluation_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_post_evaluation_ibfk_3` FOREIGN KEY (`post_id`) REFERENCES `app_company_post` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_post_group`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_post_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) DEFAULT NULL,
  `post_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `group_id` (`group_id`),
  KEY `company_id` (`company_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `app_company_post_group_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `app_company_group` (`group_id`),
  CONSTRAINT `app_company_post_group_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_post_group_ibfk_3` FOREIGN KEY (`post_id`) REFERENCES `app_company_post` (`post_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2328 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_post_like`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_post_like` (
  `like_id` int(11) NOT NULL AUTO_INCREMENT,
  `like_created_at` datetime DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `post_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`like_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `app_company_post_like_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_post_like_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_post_like_ibfk_3` FOREIGN KEY (`post_id`) REFERENCES `app_company_post` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_post_media`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_post_media` (
  `media_id` int(11) NOT NULL AUTO_INCREMENT,
  `media_file` varchar(255) DEFAULT NULL,
  `media_order` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `post_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`media_id`),
  KEY `company_id` (`company_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `app_company_post_media_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_post_media_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `app_company_post` (`post_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1144 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_qrcode_point`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_qrcode_point` (
  `point_id` varchar(36) NOT NULL,
  `point_created` datetime DEFAULT NULL,
  `point_start` datetime DEFAULT NULL,
  `point_code` varchar(20) DEFAULT NULL,
  `point_end` datetime DEFAULT NULL,
  `point_status` int(11) DEFAULT NULL,
  `point_name` varchar(255) DEFAULT NULL,
  `point_description` text,
  `point_points` int(11) DEFAULT NULL,
  `point_points_expires` int(11) DEFAULT NULL,
  `point_coins` int(11) DEFAULT NULL,
  `point_coins_expires` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`point_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_qrcode_point_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_qrcode_point_check`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_qrcode_point_check` (
  `check_id` varchar(36) NOT NULL,
  `check_created` datetime DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `point_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`check_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  KEY `point_id` (`point_id`),
  CONSTRAINT `app_company_qrcode_point_check_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_qrcode_point_check_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_qrcode_point_check_ibfk_3` FOREIGN KEY (`point_id`) REFERENCES `app_company_qrcode_point` (`point_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_reaction`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_reaction` (
  `reaction_id` int(11) NOT NULL AUTO_INCREMENT,
  `reaction_type` varchar(24) DEFAULT NULL,
  `reaction_created` datetime DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `item_type` varchar(30) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`reaction_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_reaction_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_reaction_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5769 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_sapiens_folder`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_sapiens_folder` (
  `folder_id` varchar(36) NOT NULL,
  `folder_title` varchar(255) DEFAULT NULL,
  `folder_description` varchar(255) DEFAULT NULL,
  `folder_slug` varchar(255) DEFAULT NULL,
  `folder_avatar` varchar(255) DEFAULT NULL,
  `folder_status` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`folder_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_sapiens_folder_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_sapiens_folder_editor`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_sapiens_folder_editor` (
  `editor_id` varchar(36) NOT NULL,
  `folder_id` varchar(36) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`editor_id`),
  KEY `company_id` (`company_id`),
  KEY `folder_id` (`folder_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_sapiens_folder_editor_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_sapiens_folder_editor_ibfk_2` FOREIGN KEY (`folder_id`) REFERENCES `app_company_sapiens_folder` (`folder_id`),
  CONSTRAINT `app_company_sapiens_folder_editor_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_sapiens_folder_group`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_sapiens_folder_group` (
  `item_id` varchar(36) NOT NULL,
  `group_id` int(11) DEFAULT NULL,
  `folder_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `company_id` (`company_id`),
  KEY `group_id` (`group_id`),
  KEY `folder_id` (`folder_id`),
  CONSTRAINT `app_company_sapiens_folder_group_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_sapiens_folder_group_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `app_company_group` (`group_id`),
  CONSTRAINT `app_company_sapiens_folder_group_ibfk_3` FOREIGN KEY (`folder_id`) REFERENCES `app_company_sapiens_folder` (`folder_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_sapiens_folder_tag`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_sapiens_folder_tag` (
  `item_id` varchar(36) NOT NULL,
  `folder_id` varchar(36) DEFAULT NULL,
  `tag_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `company_id` (`company_id`),
  KEY `folder_id` (`folder_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `app_company_sapiens_folder_tag_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_sapiens_folder_tag_ibfk_2` FOREIGN KEY (`folder_id`) REFERENCES `app_company_sapiens_folder` (`folder_id`),
  CONSTRAINT `app_company_sapiens_folder_tag_ibfk_3` FOREIGN KEY (`tag_id`) REFERENCES `app_company_sapiens_tag` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_sapiens_tag`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_sapiens_tag` (
  `tag_id` varchar(36) NOT NULL,
  `tag_title` varchar(255) DEFAULT NULL,
  `tag_slug` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`tag_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_sapiens_tag_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_sapiens_topic`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_sapiens_topic` (
  `topic_id` varchar(36) NOT NULL,
  `topic_title` varchar(255) DEFAULT NULL,
  `topic_content` text,
  `topic_created` datetime DEFAULT NULL,
  `topic_status` int(11) DEFAULT NULL,
  `folder_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`topic_id`),
  KEY `company_id` (`company_id`),
  KEY `folder_id` (`folder_id`),
  CONSTRAINT `app_company_sapiens_topic_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_sapiens_topic_ibfk_2` FOREIGN KEY (`folder_id`) REFERENCES `app_company_sapiens_folder` (`folder_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_sapiens_topic_file`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_sapiens_topic_file` (
  `file_id` varchar(36) NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `topic_id` varchar(36) DEFAULT NULL,
  `folder_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`file_id`),
  KEY `company_id` (`company_id`),
  KEY `folder_id` (`folder_id`),
  KEY `topic_id` (`topic_id`),
  CONSTRAINT `app_company_sapiens_topic_file_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_sapiens_topic_file_ibfk_2` FOREIGN KEY (`folder_id`) REFERENCES `app_company_sapiens_folder` (`folder_id`),
  CONSTRAINT `app_company_sapiens_topic_file_ibfk_3` FOREIGN KEY (`topic_id`) REFERENCES `app_company_sapiens_topic` (`topic_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_script`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_script` (
  `script_id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) DEFAULT NULL,
  `script_name` varchar(100) DEFAULT NULL,
  `script_content` text,
  `script_position` enum('head','body','body_end','on_lead') DEFAULT 'head',
  `script_status` tinyint(4) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`script_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_store`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_store` (
  `store_id` varchar(36) NOT NULL,
  `store_name` varchar(255) DEFAULT NULL,
  `store_status` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`store_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_store_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_store_category`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_store_category` (
  `category_id` varchar(36) NOT NULL,
  `category_name` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `category_cover` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_store_category_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_store_manager`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_store_manager` (
  `manager_id` varchar(36) NOT NULL,
  `store_id` varchar(36) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`manager_id`),
  KEY `store_id` (`store_id`),
  KEY `user_id` (`user_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_store_manager_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `app_company_store` (`store_id`),
  CONSTRAINT `app_company_store_manager_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_store_manager_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_store_order`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_store_order` (
  `order_id` varchar(36) NOT NULL,
  `order_protocol` varchar(36) DEFAULT NULL,
  `order_created` datetime DEFAULT NULL,
  `order_status` int(11) DEFAULT NULL,
  `order_status_change` datetime DEFAULT NULL,
  `order_address_zipcode` varchar(12) DEFAULT NULL,
  `order_address_street` varchar(255) DEFAULT NULL,
  `order_address_number` varchar(255) DEFAULT NULL,
  `order_address_complement` varchar(255) DEFAULT NULL,
  `order_address_neighborhood` varchar(255) DEFAULT NULL,
  `order_address_city` varchar(255) DEFAULT NULL,
  `order_address_state` varchar(255) DEFAULT NULL,
  `order_value` int(11) DEFAULT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `app_company_store_order_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_store_order_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_store_order_ibfk_4` FOREIGN KEY (`product_id`) REFERENCES `app_company_store_product` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_store_order_message`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_store_order_message` (
  `message_id` varchar(36) NOT NULL,
  `message_title` varchar(255) DEFAULT NULL,
  `message_content` text,
  `message_created` datetime DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `order_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`message_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `app_company_store_order_message_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_store_order_message_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_store_order_message_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `app_company_store_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_store_product`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_store_product` (
  `product_id` varchar(36) NOT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `product_description` text,
  `product_status` int(11) DEFAULT NULL,
  `product_stock` int(11) DEFAULT NULL,
  `product_cover` varchar(255) DEFAULT NULL,
  `product_coins` int(11) DEFAULT NULL,
  `app_company_store_product` varchar(36) DEFAULT 'fisico',
  `category_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `product_user_limit_redeem` int(11) DEFAULT '0',
  `product_type` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `product_redeem_message` longtext,
  PRIMARY KEY (`product_id`),
  KEY `category_id` (`category_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_store_product_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `app_company_store_category` (`category_id`),
  CONSTRAINT `app_company_store_product_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_store_product_level`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_store_product_level` (
  `item_id` varchar(36) NOT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `level_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `product_id` (`product_id`),
  KEY `level_id` (`level_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_store_product_level_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `app_company_store_product` (`product_id`),
  CONSTRAINT `app_company_store_product_level_ibfk_2` FOREIGN KEY (`level_id`) REFERENCES `app_company_level` (`level_id`),
  CONSTRAINT `app_company_store_product_level_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_store_product_voucher`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_store_product_voucher` (
  `voucher_id` varchar(36) NOT NULL,
  `voucher_code` varchar(255) DEFAULT NULL,
  `voucher_status` int(11) DEFAULT NULL,
  `voucher_created` datetime DEFAULT NULL,
  `voucher_taked` datetime DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `order_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`voucher_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `app_company_store_product_voucher_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_store_product_voucher_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_store_product_voucher_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `app_company_store_product` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_store_product_voucher_ibfk_4` FOREIGN KEY (`order_id`) REFERENCES `app_company_store_order` (`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_survey`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_survey` (
  `survey_id` varchar(36) NOT NULL,
  `survey_description` varchar(1000) DEFAULT NULL,
  `survey_status` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `survey_name` varchar(255) DEFAULT NULL,
  `survey_points` int(11) DEFAULT '0',
  `survey_coins` int(11) DEFAULT '0',
  PRIMARY KEY (`survey_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_survey_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_survey_question`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_survey_question` (
  `question_id` varchar(36) NOT NULL,
  `question_title` varchar(255) NOT NULL,
  `question_text` varchar(1000) DEFAULT NULL,
  `question_type` varchar(50) NOT NULL,
  `survey_id` varchar(36) NOT NULL,
  `company_id` int(11) DEFAULT NULL,
  `question_order` int(11) DEFAULT NULL,
  PRIMARY KEY (`question_id`),
  KEY `company_id` (`company_id`),
  KEY `app_company_survey_question_ibfk_1` (`survey_id`),
  CONSTRAINT `app_company_survey_question_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `app_company_survey` (`survey_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_survey_question_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_survey_question_answer`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_survey_question_answer` (
  `answer_id` varchar(36) NOT NULL,
  `answer_text` varchar(1000) NOT NULL,
  `question_id` varchar(36) NOT NULL,
  `company_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `answer_order` int(11) DEFAULT NULL,
  PRIMARY KEY (`answer_id`),
  KEY `company_id` (`company_id`),
  KEY `app_company_survey_question_answer_ibfk_1` (`question_id`),
  CONSTRAINT `app_company_survey_question_answer_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `app_company_survey_question` (`question_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_survey_question_answer_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_survey_user_answer`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_survey_user_answer` (
  `user_answer_id` varchar(36) NOT NULL,
  `user_id` int(11) NOT NULL,
  `question_id` varchar(36) NOT NULL,
  `answer_id` varchar(36) DEFAULT NULL,
  `survey_id` varchar(36) NOT NULL,
  `company_id` int(11) DEFAULT NULL,
  `text_response` varchar(1000) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`user_answer_id`),
  KEY `user_id` (`user_id`),
  KEY `survey_id` (`survey_id`),
  KEY `company_id` (`company_id`),
  KEY `question_id` (`question_id`),
  KEY `answer_id` (`answer_id`),
  CONSTRAINT `app_company_survey_user_answer_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`),
  CONSTRAINT `app_company_survey_user_answer_ibfk_4` FOREIGN KEY (`survey_id`) REFERENCES `app_company_survey` (`survey_id`),
  CONSTRAINT `app_company_survey_user_answer_ibfk_5` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_survey_user_answer_ibfk_6` FOREIGN KEY (`question_id`) REFERENCES `app_company_survey_question` (`question_id`) ON DELETE CASCADE,
  CONSTRAINT `app_company_survey_user_answer_ibfk_7` FOREIGN KEY (`answer_id`) REFERENCES `app_company_survey_question_answer` (`answer_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_theme`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_theme` (
  `theme_id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) DEFAULT NULL,
  `d_login_background_image` varchar(255) DEFAULT NULL,
  `d_button_background` varchar(10) DEFAULT NULL,
  `d_button_text` varchar(10) DEFAULT NULL,
  `d_icon_dash_background` varchar(10) DEFAULT NULL,
  `d_icon_dash_text` varchar(10) DEFAULT NULL,
  `d_icon_sidebar_background` varchar(10) DEFAULT NULL,
  `d_icon_sidebar_text` varchar(10) DEFAULT NULL,
  `d_avatar_group_background` varchar(10) DEFAULT NULL,
  `d_avatar_group_text` varchar(10) DEFAULT NULL,
  `d_avatar_user_background` varchar(10) DEFAULT NULL,
  `d_avatar_user_text` varchar(10) DEFAULT NULL,
  `d_sidebar_background` varchar(10) DEFAULT NULL,
  `d_sidebar_text` varchar(10) DEFAULT NULL,
  `d_header_background` varchar(10) DEFAULT NULL,
  `d_header_text` varchar(10) DEFAULT NULL,
  `m_login_background_color` varchar(10) DEFAULT NULL,
  `m_button_background` varchar(10) DEFAULT NULL,
  `m_button_text` varchar(10) DEFAULT NULL,
  `m_icon_background` varchar(10) DEFAULT NULL,
  `m_icon_text` varchar(10) DEFAULT NULL,
  `m_header_background` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`theme_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_theme_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_todo`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_todo` (
  `todo_id` int(11) NOT NULL AUTO_INCREMENT,
  `todo_uuid` varchar(255) DEFAULT NULL,
  `todo_item` varchar(255) DEFAULT NULL,
  `todo_status` int(11) DEFAULT NULL,
  `todo_status_change` datetime DEFAULT NULL,
  `todo_created` datetime DEFAULT NULL,
  `todo_order` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`todo_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_todo_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_todo_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=170 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_user`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_status` int(11) DEFAULT NULL,
  `control_id` varchar(36) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `user_lastname` varchar(255) DEFAULT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `user_document` varchar(255) DEFAULT NULL,
  `user_avatar` varchar(255) DEFAULT NULL,
  `user_lang` varchar(10) DEFAULT NULL,
  `user_created` datetime DEFAULT NULL,
  `user_origin` varchar(255) DEFAULT NULL,
  `user_last_login` datetime DEFAULT NULL,
  `user_birthday` date DEFAULT NULL,
  `user_role` varchar(255) DEFAULT NULL,
  `user_address` varchar(255) DEFAULT NULL,
  `user_acl_feed` int(11) DEFAULT NULL,
  `user_acl_studio` int(11) DEFAULT NULL,
  `user_acl_sapiens` int(11) DEFAULT NULL,
  `user_acl_galileu` int(11) DEFAULT '0',
  `user_admin` int(11) DEFAULT NULL,
  `user_message_accept` int(11) DEFAULT NULL,
  `user_access_profile` int(11) DEFAULT NULL,
  `user_sign_code` text,
  `user_sign_code_expire` datetime DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `user_device_id` varchar(100) DEFAULT NULL,
  `user_phone` varchar(25) DEFAULT NULL,
  `user_level` varchar(36) DEFAULT NULL,
  `user_city` varchar(255) DEFAULT NULL,
  `user_state` varchar(255) DEFAULT NULL,
  `user_document_type` varchar(255) DEFAULT NULL,
  `user_external_id` varchar(255) DEFAULT NULL,
  `user_notes` text,
  `user_gender` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  KEY `company_id` (`company_id`),
  KEY `department_id` (`department_id`),
  KEY `user_access_profile` (`user_access_profile`),
  KEY `level_fk` (`user_level`),
  CONSTRAINT `app_company_user_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_user_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `app_company_department` (`department_id`),
  CONSTRAINT `app_company_user_ibfk_3` FOREIGN KEY (`user_access_profile`) REFERENCES `app_company_access_profile` (`profile_id`),
  CONSTRAINT `level_fk` FOREIGN KEY (`user_level`) REFERENCES `app_company_level` (`level_id`)
) ENGINE=InnoDB AUTO_INCREMENT=96214 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_user_access_control`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_user_access_control` (
  `control_id` varchar(36) NOT NULL,
  `control_name` varchar(255) DEFAULT NULL,
  `control_default` int(11) DEFAULT NULL,
  `control_module_campus` int(11) DEFAULT NULL,
  `control_module_sapiens` int(11) DEFAULT NULL,
  `control_module_channels` int(11) DEFAULT NULL,
  `control_module_messages` int(11) DEFAULT NULL,
  `control_module_incentive` int(11) DEFAULT NULL,
  `control_module_store` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `control_module_galileu` int(11) DEFAULT NULL,
  `control_module_todo` int(11) DEFAULT NULL,
  `control_module_events` int(11) DEFAULT '1',
  PRIMARY KEY (`control_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_user_access_control_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_user_custom_fields`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_user_custom_fields` (
  `field_id` int(11) NOT NULL AUTO_INCREMENT,
  `field_order` int(11) DEFAULT NULL,
  `field_name` varchar(255) DEFAULT NULL,
  `field_label` varchar(255) DEFAULT NULL,
  `field_type` varchar(255) DEFAULT NULL,
  `field_options` varchar(1024) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `field_status` int(1) DEFAULT NULL,
  PRIMARY KEY (`field_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_user_custom_fields_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_user_custom_fields_item`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_user_custom_fields_item` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `item_value` varchar(1024) DEFAULT NULL,
  `field_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `user_id` (`user_id`),
  KEY `field_id` (`field_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_user_custom_fields_item_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1708759 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_user_group`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_user_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `company_id` (`company_id`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `app_company_user_group_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_user_group_ibfk_4` FOREIGN KEY (`group_id`) REFERENCES `app_company_group` (`group_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=83142435 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_user_save`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_user_save` (
  `save_id` int(11) NOT NULL AUTO_INCREMENT,
  `save_type` varchar(255) DEFAULT NULL,
  `save_item_id` int(11) DEFAULT NULL,
  `save_created` datetime DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`save_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_user_save_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_user_save_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_user_wallet`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_user_wallet` (
  `wallet_id` varchar(36) NOT NULL,
  `wallet_points` int(11) DEFAULT NULL,
  `wallet_coins` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`wallet_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_user_wallet_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_user_wallet_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_user_wallet_coins`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_user_wallet_coins` (
  `coins_id` varchar(36) NOT NULL,
  `coins_value` int(11) DEFAULT NULL,
  `coins_available` int(11) DEFAULT NULL,
  `coins_created` datetime DEFAULT NULL,
  `coins_expire` datetime DEFAULT NULL,
  `coins_description` varchar(255) DEFAULT NULL,
  `extract_type` varchar(15) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `coins_reference` varchar(255) DEFAULT NULL,
  `coins_flag` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`coins_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_user_wallet_coins_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_user_wallet_coins_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_user_wallet_points`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_user_wallet_points` (
  `points_id` varchar(36) NOT NULL,
  `points_value` int(11) DEFAULT NULL,
  `points_created` datetime DEFAULT NULL,
  `points_expire` datetime DEFAULT NULL,
  `points_description` varchar(255) DEFAULT NULL,
  `extract_type` varchar(15) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `points_reference` varchar(255) DEFAULT NULL,
  `points_flag` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`points_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `app_company_user_wallet_points_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_user_wallet_points_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_whatsapp_log`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_whatsapp_log` (
  `item_id` varchar(36) NOT NULL,
  `item_status` int(11) DEFAULT NULL,
  `item_message` varchar(1000) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_wiki`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_wiki` (
  `wiki_id` int(11) NOT NULL AUTO_INCREMENT,
  `wiki_title` varchar(255) DEFAULT NULL,
  `wiki_content` text,
  `wiki_tags` varchar(255) DEFAULT NULL,
  `wiki_created` datetime DEFAULT NULL,
  `wiki_status` int(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`wiki_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_wiki_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`),
  CONSTRAINT `app_company_wiki_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `app_company_wiki_category` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_company_wiki_category`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_company_wiki_category` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_uuid` varchar(255) DEFAULT NULL,
  `category_name` varchar(255) DEFAULT NULL,
  `category_slug` varchar(255) DEFAULT NULL,
  `category_order` int(11) DEFAULT NULL,
  `category_cover` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `app_company_wiki_category_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_gift_card_redeems`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_gift_card_redeems` (
  `redeem_id` int(11) NOT NULL AUTO_INCREMENT,
  `redeem_public_id` varchar(36) NOT NULL,
  `gift_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `redeem_amount` decimal(10,2) NOT NULL,
  `redeem_code` varchar(255) DEFAULT NULL,
  `redeem_pin` varchar(255) DEFAULT NULL,
  `redeem_qr_code` text,
  `redeem_link` text,
  `redeem_external_id` varchar(255) DEFAULT NULL,
  `redeem_external_status` varchar(50) DEFAULT NULL,
  `redeem_external_date` datetime DEFAULT NULL,
  `redeem_processed` tinyint(4) DEFAULT '0',
  `redeem_status` tinyint(4) DEFAULT '0',
  `redeem_error` tinyint(4) DEFAULT '0',
  `redeem_status_message` varchar(500) DEFAULT NULL,
  `transaction_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`redeem_id`),
  UNIQUE KEY `redeem_public_id` (`redeem_public_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_gift` (`gift_id`),
  KEY `idx_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_giftty_products`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_giftty_products` (
  `product_id` int(11) NOT NULL AUTO_INCREMENT,
  `product_public_id` varchar(36) NOT NULL,
  `product_giftty_id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_description` longtext,
  `product_image` varchar(500) DEFAULT NULL,
  `product_price` decimal(10,2) NOT NULL,
  `product_price_promo` varchar(50) DEFAULT NULL,
  `product_status` tinyint(4) DEFAULT '1',
  `product_type` varchar(100) DEFAULT NULL,
  `product_instructions` longtext,
  `product_deadline` longtext,
  `product_utilization` longtext,
  `product_category` varchar(255) DEFAULT NULL,
  `product_category_id` int(11) DEFAULT NULL,
  `product_department` varchar(255) DEFAULT NULL,
  `product_department_id` int(11) DEFAULT NULL,
  `product_owner` varchar(255) DEFAULT NULL,
  `product_owner_id` int(11) DEFAULT NULL,
  `product_stock` int(11) DEFAULT '0',
  `product_increase_tax` float DEFAULT '0',
  `last_stock_update` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `product_public_id` (`product_public_id`),
  KEY `idx_giftty_id` (`product_giftty_id`),
  KEY `idx_category` (`product_category`)
) ENGINE=InnoDB AUTO_INCREMENT=954 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `backup_upload_base_mwm`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backup_upload_base_mwm` (
  `_mb_row_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `distribuidor_nome` varchar(255) DEFAULT NULL,
  `promotor_nome` varchar(255) DEFAULT NULL,
  `gerente_email` varchar(255) DEFAULT NULL,
  `vendedor_nome` varchar(255) DEFAULT NULL,
  `vendedor_email` varchar(255) DEFAULT NULL,
  `unnamed_column` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`_mb_row_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2341 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `cg_users`
--

SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `cg_users` AS SELECT 
 1 AS `user_id`,
 1 AS `user_name`,
 1 AS `user_lastname`,
 1 AS `user_email`,
 1 AS `user_document`,
 1 AS `user_phone`,
 1 AS `user_avatar`,
 1 AS `user_created`,
 1 AS `user_address`,
 1 AS `user_state`,
 1 AS `user_city`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `cronjobs_logs`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cronjobs_logs` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `log_created` datetime DEFAULT NULL,
  `log_cron_start` datetime DEFAULT NULL,
  `log_cron_end` datetime DEFAULT NULL,
  `log_s3` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `cronjobs_logs_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `app_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `email_campaign_logs`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_campaign_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email_campaign_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `log_status` enum('queued','sent','failed','opened','clicked') DEFAULT 'queued',
  `log_sent_at` datetime DEFAULT NULL,
  `log_opened_at` datetime DEFAULT NULL,
  `log_clicked_at` datetime DEFAULT NULL,
  `log_error` text,
  `log_created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_campaign` (`email_campaign_id`),
  KEY `idx_company` (`company_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status` (`email_campaign_id`,`log_status`),
  KEY `idx_campaign_user` (`email_campaign_id`,`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `email_campaigns`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_campaigns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) NOT NULL,
  `campaign_name` varchar(255) NOT NULL,
  `campaign_subject` varchar(255) NOT NULL,
  `campaign_description` text,
  `campaign_design_json` longtext,
  `campaign_html` longtext,
  `campaign_status` enum('draft','scheduled','sending','sent','cancelled') DEFAULT 'draft',
  `campaign_recipients` json DEFAULT NULL,
  `campaign_recipients_count` int(11) DEFAULT '0',
  `campaign_scheduled_at` datetime DEFAULT NULL,
  `campaign_sent_at` datetime DEFAULT NULL,
  `campaign_created_by` int(11) DEFAULT NULL,
  `campaign_created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `campaign_updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_company` (`company_id`),
  KEY `idx_status` (`company_id`,`campaign_status`),
  KEY `idx_scheduled` (`campaign_status`,`campaign_scheduled_at`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `email_credits`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_credits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) NOT NULL,
  `credit_month_reference` varchar(7) NOT NULL,
  `credit_month_limit` int(11) NOT NULL DEFAULT '0',
  `credit_month_used` int(11) NOT NULL DEFAULT '0',
  `credit_auto_renew` tinyint(1) DEFAULT '1',
  `credit_auto_amount` int(11) DEFAULT '0',
  `credit_created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `credit_updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_company_month` (`company_id`,`credit_month_reference`),
  KEY `idx_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `login_attempts`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_attempts` (
  `attempt_id` int(11) NOT NULL AUTO_INCREMENT,
  `attempt_ip` varchar(36) DEFAULT NULL,
  `attempt_qtd` int(11) DEFAULT NULL,
  `attempt_date` datetime DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `attempt_type` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`attempt_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `login_attempts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `app_company_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=651947 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rabbit_logs`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rabbit_logs` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `log_created` datetime DEFAULT NULL,
  `log_company_flag` varchar(255) DEFAULT NULL,
  `log_key` varchar(255) DEFAULT NULL,
  `log_body` json DEFAULT NULL,
  `log_response` json DEFAULT NULL,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14577 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `upload_base_mwm_compilada_para_metabase_xlsx___co_20250328141232`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `upload_base_mwm_compilada_para_metabase_xlsx___co_20250328141232` (
  `_mb_row_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `distribuidor_nome` varchar(255) DEFAULT NULL,
  `promotor_nome` varchar(255) DEFAULT NULL,
  `gerente_email` varchar(255) DEFAULT NULL,
  `vendedor_nome` varchar(255) DEFAULT NULL,
  `vendedor_email` varchar(255) DEFAULT NULL,
  `unnamed_column` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`_mb_row_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2341 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `upload_cargos_pagina1_20251016180449`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `upload_cargos_pagina1_20251016180449` (
  `_mb_row_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `vendedor` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `documento` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`_mb_row_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2048 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `upload_tupy_agosto_data_20250926193542`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `upload_tupy_agosto_data_20250926193542` (
  `_mb_row_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cod` bigint(20) DEFAULT NULL,
  `representante` varchar(255) DEFAULT NULL,
  `meta` double DEFAULT NULL,
  `meta_atingido` varchar(255) DEFAULT NULL,
  `atingiu` bigint(20) DEFAULT NULL,
  `incremento` bigint(20) DEFAULT NULL,
  `ativacao` bigint(20) DEFAULT NULL,
  `reativacao` bigint(20) DEFAULT NULL,
  `total` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`_mb_row_id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `view_rex_poupancao`
--

SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_rex_poupancao` AS SELECT 
 1 AS `payment_id`,
 1 AS `payment_status`,
 1 AS `payment_value`,
 1 AS `payment_available`,
 1 AS `order_id`,
 1 AS `order_external_id`,
 1 AS `item_id`,
 1 AS `item_final_value`,
 1 AS `item_value`,
 1 AS `item_discount_percent`,
 1 AS `item_discount_value`,
 1 AS `order_sell_date`,
 1 AS `order_created`,
 1 AS `level_name`,
 1 AS `level_flag`,
 1 AS `group_name`,
 1 AS `group_flag`,
 1 AS `user_id`,
 1 AS `user_name`,
 1 AS `user_email`,
 1 AS `user_document`,
 1 AS `product_external_id`,
 1 AS `product_name`,
 1 AS `challenge_id`,
 1 AS `challenge_name`,
 1 AS `challenge_status`,
 1 AS `challenge_start`,
 1 AS `challenge_end`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_rex_poupancao_chargebacks`
--

SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_rex_poupancao_chargebacks` AS SELECT 
 1 AS `payment_id`,
 1 AS `payment_value`,
 1 AS `chargeback_id`,
 1 AS `chargeback_external_id`,
 1 AS `item_id`,
 1 AS `item_final_value`,
 1 AS `chargeback_date`,
 1 AS `chargeback_created`,
 1 AS `level_name`,
 1 AS `level_flag`,
 1 AS `group_name`,
 1 AS `group_flag`,
 1 AS `user_id`,
 1 AS `user_name`,
 1 AS `user_email`,
 1 AS `user_document`,
 1 AS `product_external_id`,
 1 AS `product_name`,
 1 AS `challenge_id`,
 1 AS `challenge_name`,
 1 AS `challenge_status`,
 1 AS `challenge_start`,
 1 AS `challenge_end`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `whatsapp_campaign_logs`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `whatsapp_campaign_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `whatsapp_campaign_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_phone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `log_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'queued',
  `log_sent_at` datetime DEFAULT NULL,
  `log_delivered_at` datetime DEFAULT NULL,
  `log_error` text COLLATE utf8mb4_unicode_ci,
  `log_created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_campaign_status` (`whatsapp_campaign_id`,`log_status`),
  KEY `idx_company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `whatsapp_campaigns`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `whatsapp_campaigns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) NOT NULL,
  `campaign_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `campaign_description` text COLLATE utf8mb4_unicode_ci,
  `message_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'text',
  `campaign_message` text COLLATE utf8mb4_unicode_ci,
  `campaign_image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `campaign_video_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `campaign_footer_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `campaign_buttons` json DEFAULT NULL,
  `campaign_carousel` json DEFAULT NULL,
  `campaign_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `campaign_recipients` json DEFAULT NULL,
  `campaign_recipients_count` int(11) DEFAULT '0',
  `campaign_scheduled_at` datetime DEFAULT NULL,
  `campaign_sent_at` datetime DEFAULT NULL,
  `evasend_campaign_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `campaign_created_by` int(11) DEFAULT NULL,
  `campaign_created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `campaign_updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_company_status` (`company_id`,`campaign_status`),
  KEY `idx_status` (`campaign_status`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `whatsapp_credits`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `whatsapp_credits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) NOT NULL,
  `credit_month_reference` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `credit_month_limit` int(11) DEFAULT '0',
  `credit_month_used` int(11) DEFAULT '0',
  `credit_auto_renew` tinyint(4) DEFAULT '0',
  `credit_auto_amount` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_company_month` (`company_id`,`credit_month_reference`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'bravohub_application'
--
--
-- WARNING: can't read the INFORMATION_SCHEMA.libraries table. It's most probably an old server 5.7.12.
--
--
-- WARNING: can't read the INFORMATION_SCHEMA.libraries table. It's most probably an old server 5.7.12.
--
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`torors`@`%` FUNCTION `ExtractNumber`(in_string VARCHAR(50)) RETURNS int(11)
    NO SQL
BEGIN
    DECLARE ctrNumber VARCHAR(50);
    DECLARE finNumber VARCHAR(50) DEFAULT '';
    DECLARE sChar VARCHAR(1);
    DECLARE inti INTEGER DEFAULT 1;

    IF LENGTH(in_string) > 0 THEN
        WHILE(inti <= LENGTH(in_string)) DO
            SET sChar = SUBSTRING(in_string, inti, 1);
            SET ctrNumber = FIND_IN_SET(sChar, '0,1,2,3,4,5,6,7,8,9'); 
            IF ctrNumber > 0 THEN
                SET finNumber = CONCAT(finNumber, sChar);
            END IF;
            SET inti = inti + 1;
        END WHILE;
        RETURN CAST(finNumber AS UNSIGNED);
    ELSE
        RETURN 0;
    END IF;    
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `cg_users`
--

/*!50001 DROP VIEW IF EXISTS `cg_users`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`torors`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `cg_users` AS select `app_company_user`.`user_id` AS `user_id`,`app_company_user`.`user_name` AS `user_name`,`app_company_user`.`user_lastname` AS `user_lastname`,`app_company_user`.`user_email` AS `user_email`,`app_company_user`.`user_document` AS `user_document`,`app_company_user`.`user_phone` AS `user_phone`,`app_company_user`.`user_avatar` AS `user_avatar`,`app_company_user`.`user_created` AS `user_created`,`app_company_user`.`user_address` AS `user_address`,`app_company_user`.`user_state` AS `user_state`,`app_company_user`.`user_city` AS `user_city` from `app_company_user` where (`app_company_user`.`company_id` = 19) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_rex_poupancao`
--

/*!50001 DROP VIEW IF EXISTS `view_rex_poupancao`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`torors`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `view_rex_poupancao` AS select `P`.`payment_id` AS `payment_id`,`P`.`payment_status` AS `payment_status`,`P`.`payment_value` AS `payment_value`,`P`.`payment_available` AS `payment_available`,`I`.`order_id` AS `order_id`,`O`.`order_external_id` AS `order_external_id`,`I`.`item_id` AS `item_id`,(`I`.`item_value` - `I`.`item_discount_value`) AS `item_final_value`,`I`.`item_value` AS `item_value`,`I`.`item_discount_percent` AS `item_discount_percent`,`I`.`item_discount_value` AS `item_discount_value`,(`O`.`order_sell_date` - interval 3 hour) AS `order_sell_date`,`O`.`order_created` AS `order_created`,`L`.`level_name` AS `level_name`,`L`.`level_flag` AS `level_flag`,`G`.`group_name` AS `group_name`,`G`.`group_flag` AS `group_flag`,`U`.`user_id` AS `user_id`,`U`.`user_name` AS `user_name`,`U`.`user_email` AS `user_email`,`U`.`user_document` AS `user_document`,`PR`.`product_external_id` AS `product_external_id`,`PR`.`product_name` AS `product_name`,`C`.`challenge_id` AS `challenge_id`,`C`.`challenge_name` AS `challenge_name`,`C`.`challenge_status` AS `challenge_status`,`C`.`challenge_start` AS `challenge_start`,`C`.`challenge_end` AS `challenge_end` from ((((((((`app_company_campaign_rex_order_item_payments` `P` join `app_company_campaign_rex_order_items` `I` on((`I`.`item_id` = `P`.`item_id`))) join `app_company_campaign_rex_products` `PR` on((`PR`.`product_id` = `I`.`product_id`))) join `app_company_campaign_rex_orders` `O` on((`O`.`order_id` = `I`.`order_id`))) join `app_company_campaign_rex_challenges` `C` on((`C`.`challenge_id` = `I`.`challenge_id`))) join `app_company_campaign_rex_actors` `A` on((`P`.`user_id` = `A`.`user_id`))) join `app_company_campaign_rex_levels` `L` on((`L`.`level_id` = `A`.`level_id`))) join `app_company_campaign_rex_groups` `G` on((`G`.`group_id` = `L`.`group_id`))) join `app_company_user` `U` on((`U`.`user_id` = `A`.`user_id`))) where (`P`.`campaign_id` = 90) order by (`O`.`order_sell_date` - interval 3 hour) desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_rex_poupancao_chargebacks`
--

/*!50001 DROP VIEW IF EXISTS `view_rex_poupancao_chargebacks`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`torors`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `view_rex_poupancao_chargebacks` AS select `P`.`payment_id` AS `payment_id`,`P`.`payment_value` AS `payment_value`,`I`.`chargeback_id` AS `chargeback_id`,`CB`.`chargeback_external_id` AS `chargeback_external_id`,`I`.`item_id` AS `item_id`,`I`.`item_value` AS `item_final_value`,(`CB`.`chargeback_date` - interval 3 hour) AS `chargeback_date`,`CB`.`chargeback_created` AS `chargeback_created`,`L`.`level_name` AS `level_name`,`L`.`level_flag` AS `level_flag`,`G`.`group_name` AS `group_name`,`G`.`group_flag` AS `group_flag`,`U`.`user_id` AS `user_id`,`U`.`user_name` AS `user_name`,`U`.`user_email` AS `user_email`,`U`.`user_document` AS `user_document`,`PR`.`product_external_id` AS `product_external_id`,`PR`.`product_name` AS `product_name`,`C`.`challenge_id` AS `challenge_id`,`C`.`challenge_name` AS `challenge_name`,`C`.`challenge_status` AS `challenge_status`,`C`.`challenge_start` AS `challenge_start`,`C`.`challenge_end` AS `challenge_end` from ((((((((`app_company_campaign_rex_chargeback_item_payments` `P` join `app_company_campaign_rex_chargeback_items` `I` on((`I`.`item_id` = `P`.`item_id`))) join `app_company_campaign_rex_products` `PR` on((`PR`.`product_id` = `I`.`product_id`))) join `app_company_campaign_rex_chargebacks` `CB` on((`CB`.`chargeback_id` = `I`.`chargeback_id`))) join `app_company_campaign_rex_challenges` `C` on((`C`.`challenge_id` = `I`.`challenge_id`))) join `app_company_campaign_rex_actors` `A` on((`P`.`user_id` = `A`.`user_id`))) join `app_company_campaign_rex_levels` `L` on((`L`.`level_id` = `A`.`level_id`))) join `app_company_campaign_rex_groups` `G` on((`G`.`group_id` = `L`.`group_id`))) join `app_company_user` `U` on((`U`.`user_id` = `A`.`user_id`))) where (`P`.`campaign_id` = 90) order by (`CB`.`chargeback_date` - interval 3 hour) desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-04 17:13:04
