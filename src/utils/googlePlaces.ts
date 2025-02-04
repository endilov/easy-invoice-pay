/// <reference types="@types/google.maps" />

export interface PlaceResult {
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export const initPlacesAutocomplete = (inputElement: HTMLInputElement, callback: (result: PlaceResult) => void) => {
  console.log("Initializing Places Autocomplete");
  
  const autocomplete = new google.maps.places.Autocomplete(inputElement, {
    componentRestrictions: { country: ["us", "ca"] },
    fields: ["address_components"],
    types: ["address"],
  });

  autocomplete.addListener("place_changed", () => {
    console.log("Place selected, getting details");
    const place = autocomplete.getPlace();
    const result: PlaceResult = {
      address1: "",
      address2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    };

    if (!place.address_components) {
      console.log("No address components found");
      return;
    }

    for (const component of place.address_components) {
      const type = component.types[0];
      console.log(`Processing component type: ${type}`);
      
      switch (type) {
        case "street_number":
          result.address1 = `${component.long_name} ${result.address1}`;
          break;
        case "route":
          result.address1 += component.short_name;
          break;
        case "locality":
          result.city = component.long_name;
          break;
        case "administrative_area_level_1":
          result.state = component.short_name;
          break;
        case "postal_code":
          result.zipCode = component.long_name;
          break;
        case "country":
          result.country = component.long_name === "United States" ? "US" : 
                          component.long_name === "Canada" ? "CA" : component.short_name;
          break;
      }
    }

    console.log("Calling callback with result:", result);
    callback(result);
  });

  return autocomplete;
};