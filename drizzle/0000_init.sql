CREATE TABLE `nonces` (
	`nonce` text PRIMARY KEY NOT NULL,
	`purpose` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer
);
--> statement-breakpoint
CREATE TABLE `participants` (
	`stake_address` text PRIMARY KEY NOT NULL,
	`mainnet_address` text,
	`reward_message` text,
	`reward_signature` text,
	`reward_key` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stake_address` text NOT NULL,
	`stars` integer NOT NULL,
	`comment` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`stake_address`) REFERENCES `participants`(`stake_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `feedback_stake_created` ON `feedback` (`stake_address`,`created_at`);
--> statement-breakpoint
CREATE TABLE `bugs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stake_address` text NOT NULL,
	`title` text NOT NULL,
	`steps` text NOT NULL,
	`expected` text NOT NULL,
	`actual` text NOT NULL,
	`suggested_severity` text NOT NULL,
	`official_severity` text,
	`status` text DEFAULT 'submitted' NOT NULL,
	`reviewer_stake_address` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`stake_address`) REFERENCES `participants`(`stake_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `bugs_stake` ON `bugs` (`stake_address`);
--> statement-breakpoint
CREATE INDEX `bugs_status` ON `bugs` (`status`);
