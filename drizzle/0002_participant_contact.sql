ALTER TABLE `participants` ADD `email` text;
--> statement-breakpoint
ALTER TABLE `participants` ADD `consent_test_contact` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `participants` ADD `consent_product_updates` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `participants` ADD `consent_version` text;
--> statement-breakpoint
ALTER TABLE `participants` ADD `consent_at` integer;
--> statement-breakpoint
ALTER TABLE `participants` ADD `email_updated_at` integer;
