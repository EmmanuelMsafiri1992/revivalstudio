-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: localhost    Database: revival_studio
-- ------------------------------------------------------
-- Server version	8.0.30

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

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `damage_types`
--

DROP TABLE IF EXISTS `damage_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `damage_types` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `repair_cost` decimal(10,2) NOT NULL DEFAULT '50.00',
  `sort_order` int NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `damage_types_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `damage_types`
--

LOCK TABLES `damage_types` WRITE;
/*!40000 ALTER TABLE `damage_types` DISABLE KEYS */;
INSERT INTO `damage_types` VALUES (1,'Surface Scratches','scratches','✏️',25.00,1,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(2,'Dents/Dings','dents','🔨',40.00,2,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(3,'Water Damage/Stains','water-damage','💧',60.00,3,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(4,'Broken Parts','broken-parts','💔',80.00,4,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(5,'Wobbly/Unstable','wobbly','〰️',50.00,5,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(6,'Fabric Tears','tears','✂️',70.00,6,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(7,'Fading/Discoloration','fading','🌅',45.00,7,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(8,'Peeling/Flaking','peeling','📄',55.00,8,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(9,'Missing Parts','missing-parts','❓',90.00,9,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(10,'Odor Issues','odor','👃',35.00,10,1,'2026-03-02 11:49:35','2026-03-02 11:49:35');
/*!40000 ALTER TABLE `damage_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `furniture_catalog`
--

DROP TABLE IF EXISTS `furniture_catalog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `furniture_catalog` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `furniture_type_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `style` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `available` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `furniture_catalog_furniture_type_id_foreign` (`furniture_type_id`),
  CONSTRAINT `furniture_catalog_furniture_type_id_foreign` FOREIGN KEY (`furniture_type_id`) REFERENCES `furniture_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `furniture_catalog`
--

LOCK TABLES `furniture_catalog` WRITE;
/*!40000 ALTER TABLE `furniture_catalog` DISABLE KEYS */;
INSERT INTO `furniture_catalog` VALUES (1,1,'3-Seater Sofa',NULL,699.00,'modern',NULL,1,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(2,1,'2-Seater Loveseat',NULL,499.00,'modern',NULL,1,2,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(3,1,'Corner Sofa',NULL,899.00,'scandinavian',NULL,1,3,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(4,2,'Accent Armchair',NULL,349.00,'midCentury',NULL,1,4,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(5,2,'Wingback Chair',NULL,449.00,'classic',NULL,1,5,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(6,5,'Oak Coffee Table',NULL,199.00,'scandinavian',NULL,1,6,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(7,5,'Glass Coffee Table',NULL,249.00,'modern',NULL,1,7,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(8,11,'Media Console',NULL,249.00,'modern',NULL,1,8,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(9,9,'Tall Bookcase',NULL,179.00,'classic',NULL,1,9,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(10,9,'Open Shelving Unit',NULL,149.00,'industrial',NULL,1,10,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(11,6,'King Size Bed Frame',NULL,599.00,'modern',NULL,1,11,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(12,6,'Double Bed Frame',NULL,449.00,'scandinavian',NULL,1,12,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(13,7,'2-Door Wardrobe',NULL,399.00,'classic',NULL,1,13,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(14,7,'3-Door Wardrobe',NULL,549.00,'modern',NULL,1,14,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(15,8,'6-Drawer Dresser',NULL,329.00,'classic',NULL,1,15,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(16,16,'Bedside Table Set',NULL,149.00,'scandinavian',NULL,1,16,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(17,10,'Writing Desk',NULL,249.00,'midCentury',NULL,1,17,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(18,10,'Computer Desk',NULL,199.00,'modern',NULL,1,18,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(19,17,'Ergonomic Office Chair',NULL,299.00,'modern',NULL,1,19,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(20,3,'6-Seater Dining Table',NULL,549.00,'scandinavian',NULL,1,20,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(21,3,'4-Seater Dining Table',NULL,399.00,'modern',NULL,1,21,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(22,4,'Upholstered Dining Chair',NULL,89.00,'classic',NULL,1,22,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(23,4,'Wooden Dining Chair',NULL,69.00,'scandinavian',NULL,1,23,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(24,12,'Oak Sideboard',NULL,449.00,'midCentury',NULL,1,24,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(25,13,'Display Cabinet',NULL,299.00,'classic',NULL,1,25,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(26,15,'Entryway Console',NULL,199.00,'modern',NULL,1,26,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(27,14,'Storage Ottoman',NULL,129.00,'modern',NULL,1,27,'2026-03-02 11:49:35','2026-03-02 11:49:35');
/*!40000 ALTER TABLE `furniture_catalog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `furniture_types`
--

DROP TABLE IF EXISTS `furniture_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `furniture_types` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `base_repair_cost` decimal(10,2) NOT NULL DEFAULT '100.00',
  `base_value` decimal(10,2) NOT NULL DEFAULT '500.00',
  `sort_order` int NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `furniture_types_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `furniture_types`
--

LOCK TABLES `furniture_types` WRITE;
/*!40000 ALTER TABLE `furniture_types` DISABLE KEYS */;
INSERT INTO `furniture_types` VALUES (1,'Sofa','sofa','🛋️',150.00,800.00,1,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(2,'Armchair','armchair','🪑',80.00,400.00,2,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(3,'Dining Table','dining-table','🍽️',120.00,600.00,3,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(4,'Dining Chair','dining-chair','🪑',40.00,150.00,4,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(5,'Coffee Table','coffee-table','☕',60.00,250.00,5,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(6,'Bed Frame','bed','🛏️',100.00,500.00,6,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(7,'Wardrobe','wardrobe','🚪',130.00,450.00,7,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(8,'Dresser','dresser','🗄️',90.00,350.00,8,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(9,'Bookshelf','bookshelf','📚',70.00,200.00,9,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(10,'Desk','desk','🖥️',85.00,300.00,10,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(11,'TV Stand','tv-stand','📺',55.00,180.00,11,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(12,'Sideboard','sideboard','🗃️',95.00,400.00,12,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(13,'Cabinet','cabinet','🗄️',80.00,280.00,13,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(14,'Ottoman','ottoman','🟫',45.00,120.00,14,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(15,'Console Table','console-table','🪵',50.00,200.00,15,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(16,'Bedside Table','bedside-table','🛏️',35.00,100.00,16,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(17,'Office Chair','office-chair','💺',60.00,250.00,17,1,'2026-03-02 11:49:35','2026-03-02 11:49:35');
/*!40000 ALTER TABLE `furniture_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_items`
--

DROP TABLE IF EXISTS `inventory_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `outlet_id` bigint unsigned NOT NULL,
  `furniture_type_id` bigint unsigned DEFAULT NULL,
  `item_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `repair_cost` decimal(10,2) DEFAULT NULL,
  `sale_price` decimal(10,2) DEFAULT NULL,
  `photos` json DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_items_outlet_id_foreign` (`outlet_id`),
  KEY `inventory_items_furniture_type_id_foreign` (`furniture_type_id`),
  CONSTRAINT `inventory_items_furniture_type_id_foreign` FOREIGN KEY (`furniture_type_id`) REFERENCES `furniture_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `inventory_items_outlet_id_foreign` FOREIGN KEY (`outlet_id`) REFERENCES `outlets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_items`
--

LOCK TABLES `inventory_items` WRITE;
/*!40000 ALTER TABLE `inventory_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materials`
--

DROP TABLE IF EXISTS `materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materials` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `repair_multiplier` decimal(4,2) NOT NULL DEFAULT '1.00',
  `sort_order` int NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `materials_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materials`
--

LOCK TABLES `materials` WRITE;
/*!40000 ALTER TABLE `materials` DISABLE KEYS */;
INSERT INTO `materials` VALUES (1,'Solid Wood','wood','🪵',1.30,1,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(2,'Wood Veneer','veneer','📋',1.00,2,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(3,'Fabric/Upholstered','fabric','🧵',1.20,3,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(4,'Leather','leather','👜',1.50,4,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(5,'Metal','metal','🔩',1.10,5,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(6,'Glass','glass','🪟',1.40,6,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(7,'Rattan/Wicker','rattan','🧺',1.20,7,1,'2026-03-02 11:49:35','2026-03-02 11:49:35'),(8,'Mixed Materials','mixed','🔀',1.15,8,1,'2026-03-02 11:49:35','2026-03-02 11:49:35');
/*!40000 ALTER TABLE `materials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2024_01_01_000001_create_furniture_types_table',2),(5,'2024_01_01_000002_create_materials_table',2),(6,'2024_01_01_000003_create_damage_types_table',2),(7,'2024_01_01_000004_create_outlets_table',2),(8,'2024_01_01_000005_create_repair_requests_table',2),(9,'2024_01_01_000006_create_sell_requests_table',2),(10,'2024_01_01_000007_create_room_plans_table',2),(11,'2024_01_01_000008_create_inventory_items_table',2),(12,'2024_01_01_000009_create_furniture_catalog_table',2),(13,'2026_03_02_141555_create_personal_access_tokens_table',3);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `outlets`
--

DROP TABLE IF EXISTS `outlets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `outlets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `outlets_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `outlets`
--

LOCK TABLES `outlets` WRITE;
/*!40000 ALTER TABLE `outlets` DISABLE KEYS */;
INSERT INTO `outlets` VALUES (1,'London Central','london@revivalstudio.co.uk','$2y$12$fxVPim2509tMeKDLB7nKjeXe6nJKiLOax42Vn3oWwi3qtXYLy6yqS','London','020 1234 5678','123 Furniture Lane, London EC1A 1BB',1,NULL,'2026-03-02 11:49:38','2026-03-02 11:49:38'),(2,'Manchester North','manchester@revivalstudio.co.uk','$2y$12$oESK5oXAdEh0scKWvIAnJ.ZXbec5s7q6bSLpkR5BNZ2DSLYp4F6VG','Manchester','0161 234 5678','456 Revival Road, Manchester M1 2AB',1,NULL,'2026-03-02 11:49:38','2026-03-02 11:49:38'),(3,'Birmingham','birmingham@revivalstudio.co.uk','$2y$12$/6gYN22UDsGW.5g8xMXRz.Xv0y6Xdu0iBJE4bN8Dck02CZTrlXwp.','Birmingham','0121 234 5678','789 Studio Street, Birmingham B1 1AA',1,NULL,'2026-03-02 11:49:38','2026-03-02 11:49:38');
/*!40000 ALTER TABLE `outlets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\Outlet',1,'outlet-token','a81b17ff7b8f593969d3b5f35f56446b21316a80d29e38bfb5f168a4d6dd838a','[\"*\"]',NULL,NULL,'2026-03-02 12:18:23','2026-03-02 12:18:23');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `repair_requests`
--

DROP TABLE IF EXISTS `repair_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `repair_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `furniture_type_id` bigint unsigned NOT NULL,
  `material_id` bigint unsigned NOT NULL,
  `damage_type_ids` json DEFAULT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `photos` json DEFAULT NULL,
  `estimated_min` decimal(10,2) DEFAULT NULL,
  `estimated_max` decimal(10,2) DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `outlet_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `repair_requests_furniture_type_id_foreign` (`furniture_type_id`),
  KEY `repair_requests_material_id_foreign` (`material_id`),
  KEY `repair_requests_outlet_id_foreign` (`outlet_id`),
  CONSTRAINT `repair_requests_furniture_type_id_foreign` FOREIGN KEY (`furniture_type_id`) REFERENCES `furniture_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `repair_requests_material_id_foreign` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`) ON DELETE CASCADE,
  CONSTRAINT `repair_requests_outlet_id_foreign` FOREIGN KEY (`outlet_id`) REFERENCES `outlets` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `repair_requests`
--

LOCK TABLES `repair_requests` WRITE;
/*!40000 ALTER TABLE `repair_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `repair_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_plans`
--

DROP TABLE IF EXISTS `room_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_plans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `room_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_size` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `style` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `budget` decimal(10,2) DEFAULT NULL,
  `selected_items` json DEFAULT NULL,
  `total_cost` decimal(10,2) DEFAULT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_plans`
--

LOCK TABLES `room_plans` WRITE;
/*!40000 ALTER TABLE `room_plans` DISABLE KEYS */;
/*!40000 ALTER TABLE `room_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sell_requests`
--

DROP TABLE IF EXISTS `sell_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sell_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `furniture_type_id` bigint unsigned NOT NULL,
  `age` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `condition` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'standard',
  `original_price` decimal(10,2) DEFAULT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `photos` json DEFAULT NULL,
  `estimated_min` decimal(10,2) DEFAULT NULL,
  `estimated_max` decimal(10,2) DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `outlet_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sell_requests_furniture_type_id_foreign` (`furniture_type_id`),
  KEY `sell_requests_outlet_id_foreign` (`outlet_id`),
  CONSTRAINT `sell_requests_furniture_type_id_foreign` FOREIGN KEY (`furniture_type_id`) REFERENCES `furniture_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sell_requests_outlet_id_foreign` FOREIGN KEY (`outlet_id`) REFERENCES `outlets` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sell_requests`
--

LOCK TABLES `sell_requests` WRITE;
/*!40000 ALTER TABLE `sell_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `sell_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-02 17:40:17
