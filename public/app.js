(function () {

    const $ = (id) => document.getElementById(id);


    let isHydrating = false;

    let apiData = null;


    const ENDPOINT =
        '/api/compliance/lookup';





    /*
    |--------------------------------------------------------------------------
    | VALIDATE GOOGLE REVIEWS
    |--------------------------------------------------------------------------
    */


    function validateReviews() {


        const url =
            $('googleUrl').value.trim();


        const rating =
            parseFloat(
                $('googleRating').value
            );


        const count =
            parseInt(
                $('googleCount').value,
                10
            );


        const date =
            $('googleDate').value;



        if (
            !url
            ||
            isNaN(rating)
            ||
            isNaN(count)
            ||
            !date
        ) {


            alert(
                'Google Reviews URL, Rating, Count, and Date are required.'
            );


            return false;

        }


        return true;

    }





    /*
    |--------------------------------------------------------------------------
    | COLLECT FORM DATA
    |--------------------------------------------------------------------------
    */


    function collect() {


        const data = {};



        document
            .querySelectorAll(
                'input, textarea, select'
            )
            .forEach(el => {


                if (el.id) {


                    data[el.id] =
                        el.value;

                }


            });



        return data;

    }







    /*
    |--------------------------------------------------------------------------
    | PREVIEW REPORT
    |--------------------------------------------------------------------------
    */


    function preview() {


        if (!validateReviews()) {

            return;

        }



        const d =
            collect();




        $('previewContent').innerHTML = `


<h3>
${d.firmName || 'Unknown Firm'}
</h3>




<table border="1" cellpadding="8" cellspacing="0" width="100%">



<tr>
<th align="left">
Field
</th>

<th align="left">
Value
</th>

</tr>




<tr>
<td>
Registered Name
</td>

<td>
${d.registeredName || '-'}
</td>

</tr>




<tr>
<td>
Company Number
</td>

<td>
${d.companyNumber || '-'}
</td>

</tr>




<tr>
<td>
Companies House Status
</td>

<td>
${d.chStatus || '-'}
</td>

</tr>




<tr>
<td>
Address
</td>

<td>
${d.address || '-'}
</td>

</tr>




<tr>
<td>
Website
</td>

<td>
${d.website || '-'}
</td>

</tr>




<tr>
<td>
Phone
</td>

<td>
${d.phone || '-'}
</td>

</tr>




<tr>
<td>
Google Rating
</td>

<td>
${d.googleRating || '-'}
</td>

</tr>




<tr>
<td>
Google Reviews
</td>

<td>
${d.googleCount || '-'}
</td>

</tr>




<tr>
<td>
Google URL
</td>

<td>
${d.googleUrl || '-'}
</td>

</tr>





<tr>
<td>
Companies House Risk
</td>

<td>
${d.riskCH || '-'}
</td>

</tr>





<tr>
<td>
CMA Pricing Available
</td>

<td>
${d.cmaOnline || '-'}
</td>

</tr>





<tr>
<td>
Standardised Price List
</td>

<td>
${d.splUrl || '-'}
</td>

</tr>





<tr>
<td>
CMA Evidence
</td>

<td>
${d.cmaEvidence || '-'}
</td>

</tr>





<tr>
<td>
CMA Risk
</td>

<td>
${d.riskCMAOnline || '-'}
</td>

</tr>





<tr>
<td>
SIC
</td>

<td>
${d.sic || '-'}
</td>

</tr>





<tr>
<td>
Registered Office
</td>

<td>
${d.registeredOffice || '-'}
</td>

</tr>





<tr>
<td>
Latest Filings
</td>

<td>
${(d.filings || '-')
    .replace(/\n/g, '<br>')}
</td>

</tr>




</table>


`;




        $('preview').hidden =
            false;



        $('preview').scrollIntoView({
            behavior: 'smooth'
        });


    }









    /*
    |--------------------------------------------------------------------------
    | RUN API LOOKUP
    |--------------------------------------------------------------------------
    */


    async function hydrateFromAuto() {


        isHydrating =
            true;



        const q =
            $('autoQuery')
                .value
                .trim();



        const pc =
            $('autoPostcode')
                .value
                .trim();



        const status =
            $('autoStatus');



        if (!q) {


            alert(
                'Enter a name'
            );


            isHydrating =
                false;


            return;

        }




        status.textContent =
            'Looking up...';




        try {



            const res =
                await fetch(

                    ENDPOINT,

                    {

                        method:
                            'POST',

                        headers:
                        {

                            'Content-Type':
                                'application/json',

                            'Accept':
                                'application/json'

                        },


                        body:
                            JSON.stringify(
                            {
                                query:
                                    q,

                                postcode:
                                    pc
                            })

                    }

                );





            if (!res.ok) {


                throw new Error(
                    'Request failed with status '
                    +
                    res.status
                );


            }





            const data =
                await res.json();



            console.log(
                'API DATA',
                data
            );



            apiData =
                data;



            populatePlaces(
                data.places || []
            );



            fillFields(
                data
            );



            $('btnCHOpen').disabled =
                !data.chUrl;



            status.textContent =
                'Select correct business below';




        } catch (e) {


            console.error(e);



            status.textContent =
                'Error fetching data';


        }




        isHydrating =
            false;


    }

    



    /*
    |--------------------------------------------------------------------------
    | POPULATE GOOGLE PLACES DROPDOWN
    |--------------------------------------------------------------------------
    */


    function populatePlaces(places) {


        const select =
            $('placeSelect');



        select.innerHTML =
            '<option value="">-- Select correct business --</option>';



        if (!Array.isArray(places)) {

            return;

        }



        places.forEach((p, i) => {


            const opt =
                document.createElement('option');



            opt.value =
                i;



            opt.textContent =
                `${p.name || 'Unknown'} (${p.address || 'No address'})`;



            select.appendChild(opt);



        });



    }








    /*
    |--------------------------------------------------------------------------
    | APPLY SELECTED GOOGLE PLACE
    |--------------------------------------------------------------------------
    */


    function applyPlace(place) {


        if (!place) {

            return;

        }



        $('firmName').value =
            place.name || '';



        $('address').value =
            place.address || '';



        $('googleUrl').value =
            place.googleMapsUri || '';



        $('googleRating').value =
            place.rating || '';



        $('googleCount').value =
            place.userRatingCount || '';



    }








    /*
    |--------------------------------------------------------------------------
    | FILL FORM FROM API RESPONSE
    |--------------------------------------------------------------------------
    */


    function fillFields(data) {



        Object.entries(data)
            .forEach(([key, value]) => {



                const el =
                    $(key);



                if (!el) {

                    return;

                }



                if (value === null) {

                    value = '';

                }



                if (
                    el.type === 'date'
                    &&
                    value
                ) {


                    el.value =
                        value
                            .toString()
                            .slice(0, 10);



                } else {


                    el.value =
                        value;


                }



            });






        /*
        |--------------------------------------------------------------------------
        | APPEND POSTCODE TO ADDRESS
        |--------------------------------------------------------------------------
        */


        if (
            data.postcode
            &&
            $('address').value
            &&
            !$('address')
                .value
                .includes(data.postcode)
        ) {


            $('address').value +=
                ' (' +
                data.postcode +
                ')';


        }







        /*
        |--------------------------------------------------------------------------
        | SHOPFRONT IMAGE
        |--------------------------------------------------------------------------
        */


        const preview =
            $('shopfrontPreview');



        if (data.shopfrontData) {


            preview.src =
                data.shopfrontData;



        } else {


            preview.src =
                'https://via.placeholder.com/400x250?text=No+Image';



        }





        preview.onerror =
            () => {


                preview.src =
                    'https://via.placeholder.com/400x250?text=Image+Unavailable';



            };



    }








    /*
    |--------------------------------------------------------------------------
    | EXPORT JSON
    |--------------------------------------------------------------------------
    */


    function exportJSON() {


        const data =
            collect();




        const blob =
            new Blob(

                [
                    JSON.stringify(
                        data,
                        null,
                        2
                    )
                ],

                {
                    type:
                        'application/json'
                }

            );





        const url =
            URL.createObjectURL(blob);





        const a =
            document.createElement('a');





        a.href =
            url;




        a.download =
            (
                data.firmName
                ||
                'compliance-report'
            )
            .replace(
                /\s+/g,
                '-'
            )
            .toLowerCase()
            +
            '.json';





        document.body.appendChild(a);




        a.click();




        a.remove();




        URL.revokeObjectURL(url);



    }









    /*
    |--------------------------------------------------------------------------
    | COPY SUMMARY
    |--------------------------------------------------------------------------
    */


    async function copySummary() {


        const d =
            collect();




        const text = `

Firm Name:
${d.firmName || ''}


Registered Name:
${d.registeredName || ''}


Company Number:
${d.companyNumber || ''}


Companies House Status:
${d.chStatus || ''}


Companies House Risk:
${d.riskCH || ''}


Address:
${d.address || ''}


Website:
${d.website || ''}


Phone:
${d.phone || ''}


Google Rating:
${d.googleRating || ''}


Google Reviews:
${d.googleCount || ''}


Google URL:
${d.googleUrl || ''}


CMA Pricing:
${d.cmaOnline || ''}


Standardised Price List:
${d.splUrl || ''}


CMA Risk:
${d.riskCMAOnline || ''}


`;





        try {



            await navigator.clipboard.writeText(
                text
            );



            alert(
                'Summary copied'
            );



        } catch (e) {



            console.error(e);



            alert(
                'Copy failed'
            );


        }



    }








    /*
    |--------------------------------------------------------------------------
    | RESET FORM
    |--------------------------------------------------------------------------
    */


    function resetForm() {


        if (
            !confirm(
                'Clear all entered data?'
            )
        ) {


            return;

        }





        document
            .querySelectorAll(
                'input, textarea'
            )
            .forEach(el => {



                if (
                    el.type !== 'button'
                    &&
                    el.type !== 'file'
                ) {


                    el.value =
                        '';

                }



            });






        document
            .querySelectorAll('select')
            .forEach(el => {


                el.selectedIndex =
                    0;


            });







        $('previewContent').innerHTML =
            '';



        $('preview').hidden =
            true;




        $('autoStatus').textContent =
            '';





        $('placeSelect').innerHTML =
            '<option value="">-- Select correct business --</option>';





        $('shopfrontPreview').src =
            '';





        apiData =
            null;






        const today =
            new Date()
                .toISOString()
                .slice(0, 10);




        $('dateChecked').value =
            today;



        $('googleDate').value =
            today;



    }

    



    /*
    |--------------------------------------------------------------------------
    | OPEN URL
    |--------------------------------------------------------------------------
    */


    function openUrl(url) {


        if (!url) {


            alert(
                'No URL available'
            );


            return;

        }



        window.open(
            url,
            '_blank'
        );


    }









    /*
    |--------------------------------------------------------------------------
    | PAGE LOAD
    |--------------------------------------------------------------------------
    */


    document.addEventListener(
        'DOMContentLoaded',
        () => {



            const today =
                new Date()
                    .toISOString()
                    .slice(0, 10);




            if ($('dateChecked')) {

                $('dateChecked').value =
                    today;

            }



            if ($('googleDate')) {

                $('googleDate').value =
                    today;

            }







            /*
            |--------------------------------------------------------------------------
            | AUTO LOOKUP
            |--------------------------------------------------------------------------
            */


            $('btnAuto')
                .addEventListener(
                    'click',
                    hydrateFromAuto
                );









            /*
            |--------------------------------------------------------------------------
            | GOOGLE PLACE SELECTION
            |--------------------------------------------------------------------------
            */


            $('placeSelect')
                .addEventListener(
                    'change',
                    (e) => {



                        const index =
                            e.target.value;




                        if (
                            index === ''
                        ) {


                            return;


                        }





                        applyPlace(
                            apiData.places[index]
                        );





                        $('autoStatus')
                            .textContent =
                            '✓ Correct business selected';



                    }
                );









            /*
            |--------------------------------------------------------------------------
            | PREVIEW
            |--------------------------------------------------------------------------
            */


            $('btnPreview')
                .addEventListener(
                    'click',
                    preview
                );









            /*
            |--------------------------------------------------------------------------
            | EXPORT JSON
            |--------------------------------------------------------------------------
            */


            $('btnExportJSON')
                .addEventListener(
                    'click',
                    exportJSON
                );









            /*
            |--------------------------------------------------------------------------
            | COPY SUMMARY
            |--------------------------------------------------------------------------
            */


            $('btnCopy')
                .addEventListener(
                    'click',
                    copySummary
                );









            /*
            |--------------------------------------------------------------------------
            | RESET
            |--------------------------------------------------------------------------
            */


            $('btnReset')
                .addEventListener(
                    'click',
                    resetForm
                );









            /*
            |--------------------------------------------------------------------------
            | COMPANIES HOUSE BUTTON
            |--------------------------------------------------------------------------
            */


            $('btnCHOpen')
                .addEventListener(
                    'click',
                    () => {



                        openUrl(

                            apiData?.chUrl

                            ||

                            $('chUrl').value

                        );



                    }
                );









            /*
            |--------------------------------------------------------------------------
            | WEBSITE BUTTON
            |--------------------------------------------------------------------------
            */


            $('btnOpenWebsite')
                .addEventListener(
                    'click',
                    () => {



                        openUrl(
                            $('website').value
                        );



                    }
                );









            /*
            |--------------------------------------------------------------------------
            | NAFD BUTTON
            |--------------------------------------------------------------------------
            */


            $('btnOpenNafd')
                .addEventListener(
                    'click',
                    () => {



                        openUrl(
                            $('nafdEvidence').value
                        );



                    }
                );









            /*
            |--------------------------------------------------------------------------
            | SAIF BUTTON
            |--------------------------------------------------------------------------
            */


            $('btnOpenSaif')
                .addEventListener(
                    'click',
                    () => {



                        openUrl(
                            $('saifEvidence').value
                        );



                    }
                );









            /*
            |--------------------------------------------------------------------------
            | CMA PRICE LIST BUTTON
            |--------------------------------------------------------------------------
            */


            $('btnOpenSPL')
                .addEventListener(
                    'click',
                    () => {



                        openUrl(
                            $('splUrl').value
                        );



                    }
                );




        }
    );



})();