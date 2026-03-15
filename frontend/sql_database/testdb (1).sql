-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Värd: 127.0.0.1
-- Tid vid skapande: 11 mars 2026 kl 13:58
-- Serverversion: 10.4.32-MariaDB
-- PHP-version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Databas: `testdb`
--

-- --------------------------------------------------------

--
-- Tabellstruktur `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `hotel_id` int(11) NOT NULL,
  `check_in` date NOT NULL,
  `check_out` date NOT NULL,
  `guests` int(11) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` varchar(50) DEFAULT 'confirmed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `hotel_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumpning av Data i tabell `bookings`
--

INSERT INTO `bookings` (`id`, `user_id`, `hotel_id`, `check_in`, `check_out`, `guests`, `total_price`, `status`, `created_at`, `hotel_name`) VALUES
(5, 4, 129893, '2026-03-10', '2026-03-11', 2, 220.00, 'confirmed', '2026-03-10 11:37:46', 'EOD Winter 2023 The Arlington Hotel BW Signature Collection'),
(6, 6, 129894, '2026-03-11', '2026-03-24', 1, 2860.00, 'confirmed', '2026-03-11 09:36:24', 'Davidson Motel');

-- --------------------------------------------------------

--
-- Tabellstruktur `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `fullname` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumpning av Data i tabell `users`
--

INSERT INTO `users` (`id`, `email`, `username`, `fullname`, `password`, `created_at`) VALUES
(1, 'ayub.alibarre@gmail.com', 'ayal0012', 'Ayub Ali Barre', '$argon2id$v=19$m=65536,t=3,p=4$1PWGa8ME9oMBLa5dnv10xA$UeIHNLkEAgDNpN7ryHiFWVHjhMZ4Z18jvCWdvk4BQ70', '2026-02-26 08:43:28'),
(3, 'ayubali41838@gmail.com', 'ayal00121', 'Ayub Ali', '$argon2id$v=19$m=65536,t=3,p=4$tuYjM+gAIRjY2vkMdgqd6w$DtR+i7PW8dqe3FPPH3yir5CgGn0KbEwZrQcMloqcnZ8', '2026-03-06 05:41:10'),
(4, 'ayub.alibarre111@gmail.com', 'buya', 'Ayub Ali Barre', '$argon2id$v=19$m=65536,t=3,p=4$jkaaut6ApvjK8FZHKqCbdA$2y6RxT5wMs1KozssyApS/V/7FNYmlvzIk47UeLDWu8M', '2026-03-08 00:58:03'),
(5, 'ayub.alibarre123@gmail.com', 'ayubali123', 'Ayub Ali Barre', '$argon2id$v=19$m=65536,t=3,p=4$n3M7NpXF/eikZJzHmEHo/A$gLGNeo0wynwuXhWNoucgfx9xMVuk+krmiPy3ZnFH2qQ', '2026-03-11 09:35:03'),
(6, 'ayub.alibarre99@gmail.com', 'ayub99', 'Ayub Ali Barre', '$argon2id$v=19$m=65536,t=3,p=4$i5p2gileu7n2QjFJYsYBsA$1xxGrMZvvIeNUpW5K7KYEP2QvblrXzKihq5KRJb/9i4', '2026-03-11 09:35:36');

--
-- Index för dumpade tabeller
--

--
-- Index för tabell `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_hotel_id` (`hotel_id`);

--
-- Index för tabell `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT för dumpade tabeller
--

--
-- AUTO_INCREMENT för tabell `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT för tabell `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restriktioner för dumpade tabeller
--

--
-- Restriktioner för tabell `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
