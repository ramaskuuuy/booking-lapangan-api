<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourtOperationalHour extends Model
{
    use HasFactory;

    protected $fillable = [
        'court_id',
        'day_of_week',
        'open_time',
        'close_time',
        'is_closed',
    ];

    protected $casts = [
        'day_of_week' => 'integer',
        'is_closed'   => 'boolean',
    ];

    /**
     * Relasi ke Court
     */
    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }
}
