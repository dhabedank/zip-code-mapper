const STATE_ZIP_RANGES = {
    AL: {
        min: 35000,
        max: 36999,
        file: "al_alabama_zip_codes_geo.min.json",
    },
    AK: {
        min: 99500,
        max: 99999,
        file: "ak_alaska_zip_codes_geo.min.json",
    },
    AZ: {
        min: 85000,
        max: 86599,
        file: "az_arizona_zip_codes_geo.min.json",
    },
    AR: {
        min: 71600,
        max: 72999,
        file: "ar_arkansas_zip_codes_geo.min.json",
    },
    CA: {
        min: 90000,
        max: 96699,
        file: "ca_california_zip_codes_geo.min.json",
    },
    CO: {
        min: 80000,
        max: 81699,
        file: "co_colorado_zip_codes_geo.min.json",
    },
    CT: {
        min: 06000,
        max: 06999,
        file: "ct_connecticut_zip_codes_geo.min.json",
    },
    DE: {
        min: 19700,
        max: 19999,
        file: "de_delaware_zip_codes_geo.min.json",
    },
    DC: {
        min: 20000,
        max: 20599,
        file: "dc_district_of_columbia_zip_codes_geo.min.json",
    },
    FL: {
        min: 32000,
        max: 34999,
        file: "fl_florida_zip_codes_geo.min.json",
    },
    GA: {
        min: 30000,
        max: 31999,
        file: "ga_georgia_zip_codes_geo.min.json",
    },
    HI: {
        min: 96700,
        max: 96999,
        file: "hi_hawaii_zip_codes_geo.min.json",
    },
    ID: {
        min: 83200,
        max: 83999,
        file: "id_idaho_zip_codes_geo.min.json",
    },
    IL: {
        min: 60000,
        max: 62999,
        file: "il_illinois_zip_codes_geo.min.json",
    },
    IN: {
        min: 46000,
        max: 47999,
        file: "in_indiana_zip_codes_geo.min.json",
    },
    IA: {
        min: 50000,
        max: 52999,
        file: "ia_iowa_zip_codes_geo.min.json",
    },
    KS: {
        min: 66000,
        max: 67999,
        file: "ks_kansas_zip_codes_geo.min.json",
    },
    KY: {
        min: 40000,
        max: 42799,
        file: "ky_kentucky_zip_codes_geo.min.json",
    },
    LA: {
        min: 70000,
        max: 71599,
        file: "la_louisiana_zip_codes_geo.min.json",
    },
    ME: {
        min: 03900,
        max: 04999,
        file: "me_maine_zip_codes_geo.min.json",
    },
    MD: {
        min: 20600,
        max: 21999,
        file: "md_maryland_zip_codes_geo.min.json",
    },
    MA: {
        min: 01000,
        max: 02799,
        file: "ma_massachusetts_zip_codes_geo.min.json",
    },
    MI: {
        min: 48000,
        max: 49999,
        file: "mi_michigan_zip_codes_geo.min.json",
    },
    MN: {
        min: 55001,
        max: 56763,
        file: "mn_minnesota_zip_codes_geo.min.json",
    },
    MS: {
        min: 38600,
        max: 39999,
        file: "ms_mississippi_zip_codes_geo.min.json",
    },
    MO: {
        min: 63000,
        max: 65999,
        file: "mo_missouri_zip_codes_geo.min.json",
    },
    MT: {
        min: 59000,
        max: 59999,
        file: "mt_montana_zip_codes_geo.min.json",
    },
    NE: {
        min: 68000,
        max: 69399,
        file: "ne_nebraska_zip_codes_geo.min.json",
    },
    NV: {
        min: 89000,
        max: 89899,
        file: "nv_nevada_zip_codes_geo.min.json",
    },
    NH: {
        min: 03000,
        max: 03897,
        file: "nh_new_hampshire_zip_codes_geo.min.json",
    },
    NJ: {
        min: 07000,
        max: 08999,
        file: "nj_new_jersey_zip_codes_geo.min.json",
    },
    NM: {
        min: 87000,
        max: 88499,
        file: "nm_new_mexico_zip_codes_geo.min.json",
    },
    NY: {
        min: 10000,
        max: 14999,
        file: "ny_new_york_zip_codes_geo.min.json",
    },
    NC: {
        min: 27000,
        max: 28999,
        file: "nc_north_carolina_zip_codes_geo.min.json",
    },
    ND: {
        min: 58000,
        max: 58899,
        file: "nd_north_dakota_zip_codes_geo.min.json",
    },
    OH: {
        min: 43000,
        max: 45999,
        file: "oh_ohio_zip_codes_geo.min.json",
    },
    OK: {
        min: 73000,
        max: 74999,
        file: "ok_oklahoma_zip_codes_geo.min.json",
    },
    OR: {
        min: 97000,
        max: 97999,
        file: "or_oregon_zip_codes_geo.min.json",
    },
    PA: {
        min: 15000,
        max: 19699,
        file: "pa_pennsylvania_zip_codes_geo.min.json",
    },
    RI: {
        min: 02800,
        max: 02999,
        file: "ri_rhode_island_zip_codes_geo.min.json",
    },
    SC: {
        min: 29000,
        max: 29999,
        file: "sc_south_carolina_zip_codes_geo.min.json",
    },
    SD: {
        min: 57000,
        max: 57799,
        file: "sd_south_dakota_zip_codes_geo.min.json",
    },
    TN: {
        min: 37000,
        max: 38599,
        file: "tn_tennessee_zip_codes_geo.min.json",
    },
    TX: {
        min: 75000,
        max: 79999,
        file: "tx_texas_zip_codes_geo.min.json",
    },
    UT: {
        min: 84000,
        max: 84799,
        file: "ut_utah_zip_codes_geo.min.json",
    },
    VT: {
        min: 05000,
        max: 05999,
        file: "vt_vermont_zip_codes_geo.min.json",
    },
    VA: {
        min: 22000,
        max: 24699,
        file: "va_virginia_zip_codes_geo.min.json",
    },
    WA: {
        min: 98000,
        max: 99499,
        file: "wa_washington_zip_codes_geo.min.json",
    },
    WV: {
        min: 24700,
        max: 26899,
        file: "wv_west_virginia_zip_codes_geo.min.json",
    },
    WI: {
        min: 53000,
        max: 54999,
        file: "wi_wisconsin_zip_codes_geo.min.json",
    },
    WY: {
        min: 82000,
        max: 83199,
        file: "wy_wyoming_zip_codes_geo.min.json",
    },
};