CREATE USER 'deliveryapp' IDENTIFIED BY 'deliveryappPW';

CREATE DATABASE delivery;

GRANT ALL PRIVILEGES ON delivery.* TO 'deliveryapp';

CREATE TABLE if not exists delivery.order (
	id varchar(36) primary key,
	status varchar(30),
    origin_lat varchar(30),
    origin_lng varchar(30),
    dest_lat varchar(30),
    dest_lng varchar(30),
    dist int
);