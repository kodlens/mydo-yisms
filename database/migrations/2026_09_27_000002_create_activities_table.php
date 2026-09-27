<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_category_id')->constrained('activity_categories')->restrictOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary')->nullable();
            $table->longText('description');
            $table->string('cover_image_path')->nullable();
            $table->string('venue_name');
            $table->text('venue_address')->nullable();

            // Store dates in UTC; convert to the viewer's timezone for display.
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->dateTime('registration_opens_at')->nullable();
            $table->dateTime('registration_closes_at')->nullable();

            // Null means unlimited. Pending and approved registrations reserve slots.
            // Enforce the limit in a transaction when registering or changing capacity.
            $table->unsignedInteger('capacity')->nullable();
            $table->boolean('requires_registration')->default(true);
            $table->boolean('requires_approval')->default(false);
            $table->text('eligibility_notes')->nullable();
            $table->text('requirements')->nullable();

            // draft, published, cancelled, archived; event timing is derived from dates.
            $table->string('status', 30)->default('draft');
            $table->dateTime('published_at')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->timestamps();

            $table->index(['status', 'starts_at']);
            $table->index(['activity_category_id', 'status', 'starts_at'], 'activities_category_status_start_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
