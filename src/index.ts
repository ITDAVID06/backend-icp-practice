import {
    Record,
    text,
    bool,
    update,
    nat64,
    Principal,
    Variant,
    StableBTreeMap,
    Canister,
    Result,
    Err,
    Ok,
    query,
    Vec,
}from "azle";
import { v4 as uuidv4 } from "uuid";


//Create Object for the T-shirt

const Seller = Record({
    id: Principal,
    createdAt: nat64,
    updatedAt: nat64
})

const Tshirt = Record({
    id: text,
    name: text,
    size: text,
    color: text,
    price: nat64,
    stock: nat64
})


// Initialize error variants.
const Error = Variant({
    NotFound: text,
    Unauthorized: text,
    Forbidden: text,
    BadRequest: text,
    InternalError: text,
  });


const tshirtStorage = StableBTreeMap(1, Principal, Seller);

export default Canister({
    /**
     * Create T-shirt.
     * Returns the new T-shirt.
     * Throws error if T-shirt already exists.
     * Throws error if any other error occurs.
     */
    createTShirt: update(
        [text, text, text, text, nat64, nat64],
        Result(Tshirt, Error),
        (id, name, size, color, price, stock) => {
          try {
            // If T-shirt already exists, return error.
            if (tshirtStorage.containsKey(id)) {
              return Err({ BadRequest: "T-shirt already exists" });
            }
    
            // Create new T-shirt, insert it into storage and return it.
            const newTShirt = {
              id,
              name,
              size,
              color,
              price,
              stock,
            };
            tshirtStorage.insert(id, newTShirt);
            return Ok(newTShirt);
          } catch (error) {
            // If any error occurs, return it.
            return Err({ InternalError: `${error}` });
          }
        }
      )
 /**
   * Update T-shirt.
   * Returns the updated T-shirt.
   * Throws error if T-shirt does not exist.
   * Throws error if any other error occurs.
   */
 ,updateTShirt: update(
    [text, text, text, text, nat64, nat64],
    Result(Tshirt, Error),
    (id, name, size, color, price, stock) => {
      try {
        // If T-shirt does not exist, return error.
        if (!tshirtStorage.containsKey(id)) {
          return Err({ NotFound: "T-shirt not found" });
        }

        // Update T-shirt in storage and return it.
        tshirtStorage.insert(id, {
          id,
          name,
          size,
          color,
          price,
          stock,
        });
        return Ok(tshirtStorage.get(id).Some);
      } catch (error) {
        // If any error occurs, return it.
        return Err({ InternalError: `${error}` });
      }
    }
  ),

  /**
   * Get T-shirt by ID.
   * Returns the T-shirt.
   * Throws error if T-shirt does not exist.
   * Throws error if any other error occurs.
   */
  getTShirtById: query([text], Result(Tshirt, Error), (id) => {
    try {
      // If T-shirt does not exist, return error.
      if (!tshirtStorage.containsKey(id)) {
        return Err({ NotFound: "T-shirt not found" });
      }

      // Return the T-shirt.
      return Ok(tshirtStorage.get(id).Some);
    } catch (error) {
      // If any error occurs, return it.
      return Err({ InternalError: `${error}` });
    }
  }),

  /**
   * Get all T-shirts.
   * Returns all T-shirts.
   * Throws error if any other error occurs.
   */
  getAllTShirts: query([], Result(Vec(Tshirt), Error), () => {
    try {
      // Return all T-shirts.
      return Ok(tshirtStorage.values());
    } catch (error) {
      // If any error occurs, return it.
      return Err({ InternalError: `${error}` });
    }
  }),

  /**
   * Delete T-shirt by ID.
   * Returns true if T-shirt is deleted successfully, otherwise false.
   * Throws error if any other error occurs.
   */
  deleteTShirtById: update([text], Result(bool, Error), (id) => {
    try {
      // If T-shirt does not exist, return false.
      if (!tshirtStorage.containsKey(id)) {
        return Ok(false);
      }

      // Delete the T-shirt and return true.
      tshirtStorage.delete(id);
      return Ok(true);
    } catch (error) {
      // If any error occurs, return it.
      return Err({ InternalError: `${error}` });
    }
  }),
});