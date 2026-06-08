<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ComplianceLookupController extends Controller
{
    public function lookup(Request $request)
    {
        $request->merge($request->json()->all());

        $validated = $request->validate([
            'query' => 'required|string',
            'postcode' => 'nullable|string',
        ]);

        $searchText = trim(
            $validated['query'] . ' ' . ($validated['postcode'] ?? '')
        );

        /*
        |--------------------------------------------------------------------------
        | GOOGLE PLACES SEARCH
        |--------------------------------------------------------------------------
        */

        $places = [];

        try {

            $placesResponse = Http::withHeaders([
                'X-Goog-Api-Key' => config('services.google.key'),
                'X-Goog-FieldMask' =>
                    'places.id,' .
                    'places.displayName,' .
                    'places.rating,' .
                    'places.userRatingCount,' .
                    'places.googleMapsUri,' .
                    'places.formattedAddress,' .
                    'places.photos'
            ])->post(
                'https://places.googleapis.com/v1/places:searchText',
                [
                    'textQuery' => $searchText,
                ]
            );

            if ($placesResponse->successful()) {
                $places = $placesResponse->json('places', []);
            }

        } catch (\Exception $e) {

            \Log::error('Google Places Error', [
                'message' => $e->getMessage()
            ]);
        }

        $firstPlace = $places[0] ?? [];

        /*
        |--------------------------------------------------------------------------
        | EXTRACT POSTCODE
        |--------------------------------------------------------------------------
        */

        $postcode = null;

        if (!empty($firstPlace['formattedAddress'])) {

            preg_match(
                '/[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}/i',
                $firstPlace['formattedAddress'],
                $matches
            );

            $postcode = $matches[0] ?? null;
        }

        /*
        |--------------------------------------------------------------------------
        | PLACE DETAILS
        |--------------------------------------------------------------------------
        */

        $website = null;
        $phone = null;

        if (!empty($firstPlace['id'])) {

            try {

                $detailsResponse = Http::withHeaders([
                    'X-Goog-Api-Key' => config('services.google.key'),
                    'X-Goog-FieldMask' =>
                        'websiteUri,' .
                        'nationalPhoneNumber,' .
                        'internationalPhoneNumber'
                ])->get(
                    "https://places.googleapis.com/v1/places/{$firstPlace['id']}"
                );

                if ($detailsResponse->successful()) {

                    $details = $detailsResponse->json();

                    $website = $details['websiteUri'] ?? null;

                    $phone =
                        $details['internationalPhoneNumber']
                        ?? $details['nationalPhoneNumber']
                        ?? null;
                }

            } catch (\Exception $e) {

                \Log::error('Place Details Error', [
                    'message' => $e->getMessage()
                ]);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | PHOTO
        |--------------------------------------------------------------------------
        */

        $photoUrl = null;

        if (!empty($firstPlace['photos'][0]['name'])) {

            $photoName = $firstPlace['photos'][0]['name'];

            $photoUrl =
                "https://places.googleapis.com/v1/{$photoName}/media"
                . "?maxWidthPx=400"
                . "&key=" . config('services.google.key');
        }

        /*
        |--------------------------------------------------------------------------
        | COMPANIES HOUSE
        |--------------------------------------------------------------------------
        */

        $items = [];

        try {

            $companiesResponse = Http::withBasicAuth(
                config('services.companies_house.key'),
                ''
            )->get(
                'https://api.company-information.service.gov.uk/search/companies',
                [
                    'q' => $validated['query'],
                    'items_per_page' => 5,
                ]
            );

            if ($companiesResponse->successful()) {
                $items = $companiesResponse->json('items', []);
            }

        } catch (\Exception $e) {

            \Log::error('Companies House Error', [
                'message' => $e->getMessage()
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | BETTER COMPANY MATCHING
        |--------------------------------------------------------------------------
        */

        $company = collect($items)->first(function ($item) use ($validated) {

            similar_text(
                strtoupper($item['title'] ?? ''),
                strtoupper($validated['query']),
                $percent
            );

            return $percent >= 70;
        });

        if (!$company && count($items) > 0) {
            $company = $items[0];
        }

        /*
        |--------------------------------------------------------------------------
        | COMPANY PROFILE
        |--------------------------------------------------------------------------
        */

        $companyProfile = null;
        $filings = null;

        if (!empty($company['company_number'])) {

            try {

                $profileResponse = Http::withBasicAuth(
                    config('services.companies_house.key'),
                    ''
                )->get(
                    "https://api.company-information.service.gov.uk/company/{$company['company_number']}"
                );

                if ($profileResponse->successful()) {
                    $companyProfile = $profileResponse->json();
                }

                $filingsResponse = Http::withBasicAuth(
                    config('services.companies_house.key'),
                    ''
                )->get(
                    "https://api.company-information.service.gov.uk/company/{$company['company_number']}/filing-history",
                    [
                        'items_per_page' => 5
                    ]
                );

                if ($filingsResponse->successful()) {

                    $filingsItems = $filingsResponse->json('items', []);

                    $filings = collect($filingsItems)
                        ->map(function ($f) {

                            return
                                ($f['description'] ?? '')
                                . ' (' . ($f['date'] ?? '') . ')';

                        })
                        ->implode("\n");
                }

            } catch (\Exception $e) {

                \Log::error('Company Profile Error', [
                    'message' => $e->getMessage()
                ]);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | REGISTERED OFFICE
        |--------------------------------------------------------------------------
        */

        $registeredOfficeFormatted = null;

        if (!empty($companyProfile['registered_office_address'])) {

            $registeredOfficeFormatted = implode(
                ', ',
                array_filter($companyProfile['registered_office_address'])
            );
        }

        /*
        |--------------------------------------------------------------------------
        | NAFD + SAIF
        |--------------------------------------------------------------------------
        */

        $queryEncoded = urlencode($validated['query']);

        $nafdSearch =
            "https://www.google.com/search?q=site:funeral-directory.co.uk+{$queryEncoded}";

        $saifSearch =
            "https://www.google.com/search?q=site:saif.org.uk+{$queryEncoded}";

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'places' => collect($places)->map(function ($p) {

                return [
                    'id' => $p['id'] ?? null,
                    'name' => $p['displayName']['text'] ?? null,
                    'rating' => $p['rating'] ?? null,
                    'userRatingCount' => $p['userRatingCount'] ?? null,
                    'googleMapsUri' => $p['googleMapsUri'] ?? null,
                    'address' => $p['formattedAddress'] ?? null,
                ];

            })->values(),

            'firmName' => $validated['query'],

            'registeredName' => $company['title'] ?? null,

            'companyNumber' => $company['company_number'] ?? null,

            'address' =>
                $firstPlace['formattedAddress']
                ?? $company['address_snippet']
                ?? null,

            'postcode' => $postcode,

            'website' => $website,

            'phone' => $phone,

            'dateChecked' => now()->toDateString(),

            'googleUrl' => $firstPlace['googleMapsUri'] ?? null,

            'googleRating' => $firstPlace['rating'] ?? null,

            'googleCount' => $firstPlace['userRatingCount'] ?? null,

            'googleDate' => now()->toDateString(),

            'chStatus' => $companyProfile['company_status'] ?? null,

            'sic' =>
                isset($companyProfile['sic_codes'])
                    ? implode(', ', $companyProfile['sic_codes'])
                    : null,

            'registeredOffice' => $registeredOfficeFormatted,

            'nextAccounts' =>
                $companyProfile['accounts']['next_accounts']['due_on']
                ?? null,

            'nextCS' =>
                $companyProfile['confirmation_statement']['next_due']
                ?? null,

            'filings' => $filings,

            'chUrl' =>
                !empty($company['company_number'])
                    ? 'https://find-and-update.company-information.service.gov.uk/company/' . $company['company_number']
                    : null,

            'nafdMember' => 'Check',

            'nafdEvidence' => $nafdSearch,

            'saifMember' => 'Check',

            'saifEvidence' => $saifSearch,

            'shopfrontData' => $photoUrl,

            'riskReviews' =>
                ($firstPlace
                && ($firstPlace['rating'] ?? 0) >= 4
                && ($firstPlace['userRatingCount'] ?? 0) >= 5)
                    ? 'GREEN'
                    : 'AMBER',

            'riskCH' =>
                $companyProfile
                    ? 'GREEN'
                    : 'AMBER',
        ]);
    }

}