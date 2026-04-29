import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAllPlans,
  fetchPlansByOperator, 
  fetchOperators,
  fetchActiveOperators,
  fetchCategories,
  fetchActiveCategories,
  createPlan as createPlanService,
  updatePlan as updatePlanService,
  togglePlanStatus,
  createCategory as createCategoryService,
  updateCategory as updateCategoryService,
  toggleCategoryStatus,
} from "../service/plansService";


export const loadPlans = createAsyncThunk("plans/load", async (_, thunkAPI) => {
  try {
    return await fetchAllPlans();
  } catch (err) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to load plans",
    );
  }
});

export const loadPlansByOperator = createAsyncThunk(
  "plans/loadByOperator",
  async (operatorId, thunkAPI) => {
    try {
      return await fetchPlansByOperator(operatorId);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load plans for operator",
      );
    }
  },
);

export const loadOperators = createAsyncThunk(
  "plans/loadOperators",
  async (_, thunkAPI) => {
    try {
      return await fetchOperators();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load operators",
      );
    }
  },
);

export const loadActiveOperators = createAsyncThunk(
  "plans/loadActiveOperators",
  async (_, thunkAPI) => {
    try {
      return await fetchActiveOperators();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load operators",
      );
    }
  },
);

export const loadCategories = createAsyncThunk(
  "plans/loadCategories",
  async (_, thunkAPI) => {
    try {
      return await fetchCategories();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load categories",
      );
    }
  },
);

export const loadActiveCategories = createAsyncThunk(
  "plans/loadActiveCategories",
  async (_, thunkAPI) => {
    try {
      return await fetchActiveCategories();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load categories",
      );
    }
  },
);

export const createPlan = createAsyncThunk(
  "plans/create",
  async (payload, thunkAPI) => {
    try {
      return await createPlanService(payload);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to create plan",
      );
    }
  },
);

export const editPlan = createAsyncThunk(
  "plans/edit",
  async ({ planId, payload }, thunkAPI) => {
    try {
      return await updatePlanService(planId, payload);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update plan",
      );
    }
  },
);

export const togglePlan = createAsyncThunk(
  "plans/toggle",
  async (plan, thunkAPI) => {
    try {
      await togglePlanStatus(plan.planId, plan.isActive);
      return plan.planId;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Action failed",
      );
    }
  },
);

export const addCategory = createAsyncThunk(
  "plans/addCategory",
  async (payload, thunkAPI) => {
    try {
      return await createCategoryService(payload);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to create category",
      );
    }
  },
);

export const editCategory = createAsyncThunk(
  "plans/editCategory",
  async ({ catId, payload }, thunkAPI) => {
    try {
      return await updateCategoryService(catId, payload);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update category",
      );
    }
  },
);

export const toggleCategory = createAsyncThunk(
  "plans/toggleCategory",
  async (cat, thunkAPI) => {
    try {
      await toggleCategoryStatus(cat.categoryId, cat.isActive);
      return cat.categoryId;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Action failed",
      );
    }
  },
);

/* ── Slice ── */

const plansSlice = createSlice({
  name: "plans",
  initialState: {
    plans: [],
    operators: [],
    categories: [],
    isLoading: false,
    isError: false,
    message: "",
    metaLoading: false,
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

      /* loadPlans */
      .addCase(loadPlans.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(loadPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload;
      })
      .addCase(loadPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      /* loadPlansByOperator — reuses same plans array, just filtered result */
      .addCase(loadPlansByOperator.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(loadPlansByOperator.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload;
      })
      .addCase(loadPlansByOperator.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      /* loadOperators / loadActiveOperators — both write to operators */
      .addCase(loadOperators.pending, (state) => {
        state.metaLoading = true;
      })
      .addCase(loadOperators.fulfilled, (state, action) => {
        state.metaLoading = false;
        state.operators = action.payload;
      })
      .addCase(loadOperators.rejected, (state) => {
        state.metaLoading = false;
      })

      .addCase(loadActiveOperators.pending, (state) => {
        state.metaLoading = true;
      })
      .addCase(loadActiveOperators.fulfilled, (state, action) => {
        state.metaLoading = false;
        state.operators = action.payload;
      })
      .addCase(loadActiveOperators.rejected, (state) => {
        state.metaLoading = false;
      })

      /* loadCategories / loadActiveCategories — both write to categories */
      .addCase(loadCategories.pending, (state) => {
        state.metaLoading = true;
      })
      .addCase(loadCategories.fulfilled, (state, action) => {
        state.metaLoading = false;
        state.categories = action.payload;
      })
      .addCase(loadCategories.rejected, (state) => {
        state.metaLoading = false;
      })

      .addCase(loadActiveCategories.pending, (state) => {
        state.metaLoading = true;
      })
      .addCase(loadActiveCategories.fulfilled, (state, action) => {
        state.metaLoading = false;
        state.categories = action.payload;
      })
      .addCase(loadActiveCategories.rejected, (state) => {
        state.metaLoading = false;
      })

      /* editPlan */
      .addCase(editPlan.fulfilled, (state, action) => {
        const idx = state.plans.findIndex(
          (p) => p.planId === action.payload.planId,
        );
        if (idx !== -1) state.plans[idx] = action.payload;
      })

      /* togglePlan */
      .addCase(togglePlan.fulfilled, (state, action) => {
        const p = state.plans.find((p) => p.planId === action.payload);
        if (p) p.isActive = !p.isActive;
      })

      /* addCategory */
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })

      /* editCategory */
      .addCase(editCategory.fulfilled, (state, action) => {
        const idx = state.categories.findIndex(
          (c) => c.categoryId === action.payload.categoryId,
        );
        if (idx !== -1) state.categories[idx] = action.payload;
      })

      /* toggleCategory */
      .addCase(toggleCategory.fulfilled, (state, action) => {
        const c = state.categories.find((c) => c.categoryId === action.payload);
        if (c) c.isActive = !c.isActive;
      });
  },
});

export const { reset } = plansSlice.actions;
export default plansSlice.reducer;
