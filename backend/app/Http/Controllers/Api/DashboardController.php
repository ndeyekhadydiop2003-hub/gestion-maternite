<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        return response()->json([
            'total_patientes'      => DB::table('patientes')->count(),
            'total_hospitalisees'  => DB::table('hospitalisations')->where('statut', 'active')->count(),
            'rdv_aujourdhui'       => DB::table('rendez_vous')->whereDate('date_rv', now()->toDateString())->count(),
            'transmissions_jour'   => 0,
        ]);
    }

    public function activiteJour()
    {
        $patientes = DB::table('patientes')->orderBy('created_at', 'desc')->limit(5)->get();
        return response()->json($patientes);
    }
}
