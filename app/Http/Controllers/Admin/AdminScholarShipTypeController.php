<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\ScholarshipType;
use Illuminate\Support\Facades\Validator;


class AdminScholarShipTypeController extends Controller
{
    public function index(){
        return Inertia::render('admin/scholarship-types/admin-scholarship-types-page');
    }

    public function getData(Request $req){

        $perPage = (int) $req->input('perpage', 10);
        $search = trim((string) $req->input('search', ''));

        $data = ScholarshipType::when($search !== '', function($q) use ($search){
            $q->where('scholarship', 'like', "%{$search}%");
        })
            ->orderBy('id', 'desc')
            ->paginate($perPage);

        return $data;
    }


    public function store(Request $req){
        $validated = $req->validate([
            'scholarship' => ['required', 'string', 'max:255', 'unique:scholarship_types,scholarship'],
            'target_beneficiary' => ['nullable', 'string', 'max:255'],
            'benefit' => ['nullable', 'string', 'max:255'],
            'amount' => ['nullable', 'numeric', 'min:0', 'decimal:0,2'],
            'is_active' => ['required', 'boolean']
        ]);

        ScholarshipType::create($validated);

        return response()->json([
            'message' => 'Scholarship type created successfully.',
            'success' => true
        ], 201);
    }


    public function update(Request $req, $id){
        $validated = $req->validate([
            'scholarship' => ['required', 'string', 'max:255', 'unique:scholarship_types,scholarship,'.$id.',id'],
            'target_beneficiary' => ['nullable', 'string', 'max:255'],
            'benefit' => ['nullable', 'string', 'max:255'],
            'amount' => ['nullable', 'numeric', 'min:0', 'decimal:0,2'],
            'is_active' => ['required', 'boolean']
        ]);


        $data = ScholarshipType::findOrFail($id);
        $data->scholarship = $validated['scholarship'];
        $data->target_beneficiary = $validated['target_beneficiary'];
        $data->benefit = $validated['benefit'];
        $data->amount = $validated['amount'];
        $data->is_active = $validated['is_active'] ? 1 : 0;
        $data->save();

         return response()->json([
            'message' => 'Scholarship type updated successfully.',
            'success' => true
        ], 200);
    }


    public function setActive($id){
        Validator::make(
            ['id' => $id],
            [
                'id' => ['required', 'integer', 'exists:scholarship_types,id']
            ]
        )->validate();

        $data = ScholarshipType::findOrFail($id);
        $data->is_active = 1;
        $data->save();

        return response()->json([
            'success' => true,
            'message' => "Scholarship type set to active."
        ], 200);
    }

    public function destroy($id){
        ScholarshipType::destroy($id);

        return response()->json([
            'success' => true,
            'message' => 'Scholarship type successfully deleted.'
        ], 200);
    }




}
