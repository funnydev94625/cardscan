CREATE TABLE "credit_cards" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_number" varchar(16) NOT NULL,
	"expiry_date" varchar(5) NOT NULL,
	"cvv" varchar(4) NOT NULL,
	"holder_name" text NOT NULL,
	"address" text NOT NULL,
	"phone" varchar(20) NOT NULL,
	"city" text NOT NULL,
	"state" varchar(50) NOT NULL,
	"zip_code" varchar(10) NOT NULL,
	"email" text NOT NULL,
	"country" varchar(10) DEFAULT 'US' NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"bank_name" text,
	"bin_number" varchar(6) NOT NULL
);
--> statement-breakpoint
CREATE INDEX "state_idx" ON "credit_cards" USING btree ("state");--> statement-breakpoint
CREATE INDEX "city_idx" ON "credit_cards" USING btree ("city");--> statement-breakpoint
CREATE INDEX "bin_idx" ON "credit_cards" USING btree ("bin_number");--> statement-breakpoint
CREATE INDEX "bank_idx" ON "credit_cards" USING btree ("bank_name");