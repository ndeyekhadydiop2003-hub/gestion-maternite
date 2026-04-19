<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    // Mes notifications (reçues)
    public function index(Request $request)
    {
        $userId = $request->user()->id_utilisateur;

        $notifs = DB::table('notifications')
            ->join('utilisateurs', 'notifications.id_expediteur', '=', 'utilisateurs.id_utilisateur')
            ->where(function($q) use ($userId) {
                $q->where('notifications.id_destinataire', $userId)
                  ->orWhereNull('notifications.id_destinataire');
            })
            ->orderBy('notifications.created_at', 'desc')
            ->limit(20)
            ->select(
                'notifications.*',
                'utilisateurs.login as expediteur_login',
                'utilisateurs.role_acces as expediteur_role'
            )
            ->get();

        return response()->json($notifs);
    }

    // Envoyer une notification
    public function store(Request $request)
    {
        $request->validate([
            'titre'           => 'required|string|max:255',
            'message'         => 'required|string',
            'type'            => 'in:info,urgent,alerte',
            'id_destinataire' => 'nullable|exists:utilisateurs,id_utilisateur',
        ]);

        $id = DB::table('notifications')->insertGetId([
            'titre'           => $request->titre,
            'message'         => $request->message,
            'type'            => $request->type ?? 'info',
            'id_expediteur'   => $request->user()->id_utilisateur,
            'id_destinataire' => $request->id_destinataire,
            'lu'              => false,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        return response()->json(DB::table('notifications')->find($id), 201);
    }

    // Marquer une notification comme lue
    public function marquerLu(int $id)
    {
        DB::table('notifications')->where('id', $id)->update(['lu' => true, 'updated_at' => now()]);
        return response()->json(['message' => 'Notification marquée comme lue']);
    }

    // Marquer toutes comme lues
    public function toutMarquerLu(Request $request)
    {
        $userId = $request->user()->id_utilisateur;
        DB::table('notifications')
            ->where(function($q) use ($userId) {
                $q->where('id_destinataire', $userId)->orWhereNull('id_destinataire');
            })
            ->update(['lu' => true, 'updated_at' => now()]);
        return response()->json(['message' => 'Toutes les notifications marquées comme lues']);
    }

    // Nombre de non lues
    public function nonLues(Request $request)
    {
        $userId = $request->user()->id_utilisateur;
        $count = DB::table('notifications')
            ->where('lu', false)
            ->where(function($q) use ($userId) {
                $q->where('id_destinataire', $userId)->orWhereNull('id_destinataire');
            })
            ->count();
        return response()->json(['count' => $count]);
    }
}
