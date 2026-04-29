import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAllOffers,
  toggleOfferStatus,
  endOffer,
  updateOffer as updateOfferService,
  createOffer as createOfferService,
  fetchAllPlans,
  fetchPlanOffers,
  mapOfferToPlan,
  unmapOfferFromPlan,
} from "../service/offersService";

export const loadOffers = createAsyncThunk(
  "offers/load",
  async (_, thunkAPI) => {
    try {
      return await fetchAllOffers();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load offers",
      );
    }
  },
);

export const createOffer = createAsyncThunk(
  "offers/create",
  async (payload, thunkAPI) => {
    try {
      return await createOfferService(payload);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to create offer",
      );
    }
  },
);

export const editOffer = createAsyncThunk(
  "offers/edit",
  async ({ offerId, payload }, thunkAPI) => {
    try {
      return await updateOfferService(offerId, payload);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update offer",
      );
    }
  },
);

export const toggleOffer = createAsyncThunk(
  "offers/toggle",
  async (offer, thunkAPI) => {
    try {
      await toggleOfferStatus(offer.offerId, offer.active);
      return offer.offerId;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Action failed",
      );
    }
  },
);

export const terminateOffer = createAsyncThunk(
  "offers/end",
  async (offerId, thunkAPI) => {
    try {
      await endOffer(offerId);
      return offerId;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to end offer",
      );
    }
  },
);

export const loadPlans = createAsyncThunk(
  "offers/loadPlans",
  async (_, thunkAPI) => {
    try {
      return await fetchAllPlans();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load plans",
      );
    }
  },
);

export const loadAllMappings = createAsyncThunk(
  "offers/loadMappings",
  async (_, thunkAPI) => {
    try {
      const plans = await fetchAllPlans();
      const results = await Promise.allSettled(
        plans.map((p) => fetchPlanOffers(p.planId)),
      );
      return results
        .filter((r) => r.status === "fulfilled")
        .flatMap((r) => r.value);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load mappings",
      );
    }
  },
);

export const mapOffer = createAsyncThunk(
  "offers/map",
  async ({ planId, payload }, thunkAPI) => {
    try {
      return await mapOfferToPlan(planId, payload);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to map offer",
      );
    }
  },
);

export const unmapOffer = createAsyncThunk(
  "offers/unmap",
  async ({ planId, offerId, planOfferId }, thunkAPI) => {
    try {
      await unmapOfferFromPlan(planId, offerId);
      return planOfferId;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to unmap offer",
      );
    }
  },
);

/* ── Slice ── */
const offersSlice = createSlice({
  name: "offers",
  initialState: {
    data: [],
    plans: [],
    mappings: [],
    isLoading: false,
    isError: false,
    message: "",
    metaLoading: false,
    mappingsLoading: false,
  },
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      /* loadOffers */
      .addCase(loadOffers.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(loadOffers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(loadOffers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      /* createOffer */
      .addCase(createOffer.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })

      /* editOffer */
      .addCase(editOffer.fulfilled, (state, action) => {
        const idx = state.data.findIndex(
          (o) => o.offerId === action.payload.offerId,
        );
        if (idx !== -1) state.data[idx] = action.payload;
      })

      /* toggleOffer */
      .addCase(toggleOffer.fulfilled, (state, action) => {
        const o = state.data.find((o) => o.offerId === action.payload);
        if (o) o.active = !o.active;
      })

      /* terminateOffer */
      .addCase(terminateOffer.fulfilled, (state, action) => {
        const o = state.data.find((o) => o.offerId === action.payload);
        if (o) o.active = false;
      })

      /* loadPlans */
      .addCase(loadPlans.pending, (state) => {
        state.metaLoading = true;
      })
      .addCase(loadPlans.fulfilled, (state, action) => {
        state.metaLoading = false;
        state.plans = action.payload;
      })
      .addCase(loadPlans.rejected, (state) => {
        state.metaLoading = false;
      })

      /* loadAllMappings */
      .addCase(loadAllMappings.pending, (state) => {
        state.mappingsLoading = true;
      })
      .addCase(loadAllMappings.fulfilled, (state, action) => {
        state.mappingsLoading = false;
        state.mappings = action.payload;
      })
      .addCase(loadAllMappings.rejected, (state) => {
        state.mappingsLoading = false;
      })

      /* mapOffer */
      .addCase(mapOffer.fulfilled, (state, action) => {
        state.mappings.push(action.payload);
      })

      /* unmapOffer */
      .addCase(unmapOffer.fulfilled, (state, action) => {
        state.mappings = state.mappings.filter(
          (m) => m.planOfferId !== action.payload,
        );
      });
  },
});

export const { reset } = offersSlice.actions;
export default offersSlice.reducer;
