<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    // ⚠️ Important : évite le conflit avec Illuminate\Notifications\DatabaseNotification
    protected $table = 'notifications';

    protected $primaryKey = 'id';

    protected $fillable = [
        'titre',
        'message',
        'type',        // 'info' | 'urgent' | 'alerte'
        'lu',
        'id_expediteur',
        'id_destinataire',
    ];

    protected $casts = [
        'lu'         => 'boolean',
        'created_at' => 'datetime',
    ];

    // ── Relations ──
    public function expediteur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_expediteur', 'id_utilisateur');
    }

    public function destinataire()
    {
        return $this->belongsTo(Utilisateur::class, 'id_destinataire', 'id_utilisateur');
    }
}
