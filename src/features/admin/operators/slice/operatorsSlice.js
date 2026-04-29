import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchOperators,
  createOperator,
  updateOperator,
  toggleOperatorStatus,
} from '../service/operatorsService';


export const loadOperators = createAsyncThunk(
  'operators/load',
  async (_, thunkAPI) => {
    try {
      return await fetchOperators();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to load operators'
      );
    }
  }
);

export const addOperator = createAsyncThunk(
  'operators/add',
  async (payload, thunkAPI) => {
    try {
      return await createOperator(payload);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to add operator'
      );
    }
  }
);

export const editOperator = createAsyncThunk(
  'operators/edit',
  async ({ operatorId, payload }, thunkAPI) => {
    try {
      return await updateOperator(operatorId, payload);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to update operator'
      );
    }
  }
);

export const changeOperatorStatus = createAsyncThunk(
  'operators/changeStatus',
  async ({ operatorId, isActive }, thunkAPI) => {
    try {
      await toggleOperatorStatus(operatorId, isActive);
      return { operatorId, newStatus: isActive ? 'INACTIVE' : 'ACTIVE' };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to change operator status'
      );
    }
  }
);

/* ── Slice ── */

const operatorsSlice = createSlice({
  name: 'operators',
  initialState: {
    operators: [],
    isLoading: false,
    isSaving:  false,
    isError:   false,
    message:   '',
  },
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSaving  = false;
      state.isError   = false;
      state.message   = '';
    },
  },
  extraReducers: (builder) => {
    builder

      /* loadOperators */
      .addCase(loadOperators.pending, (state) => {
        state.isLoading = true;
        state.isError   = false;
      })
      .addCase(loadOperators.fulfilled, (state, action) => {
        state.isLoading   = false;
        state.operators   = action.payload;
      })
      .addCase(loadOperators.rejected, (state, action) => {
        state.isLoading = false;
        state.isError   = true;
        state.message   = action.payload;
      })

      /* addOperator */
      .addCase(addOperator.pending, (state) => {
        state.isSaving = true;
        state.isError  = false;
      })
      .addCase(addOperator.fulfilled, (state, action) => {
        state.isSaving = false;
        state.operators.push(action.payload);
      })
      .addCase(addOperator.rejected, (state, action) => {
        state.isSaving = false;
        state.isError  = true;
        state.message  = action.payload;
      })

      /* editOperator */
      .addCase(editOperator.pending, (state) => {
        state.isSaving = true;
        state.isError  = false;
      })
      .addCase(editOperator.fulfilled, (state, action) => {
        state.isSaving  = false;
        const idx = state.operators.findIndex(
          (o) => o.operatorId === action.payload.operatorId
        );
        if (idx !== -1) state.operators[idx] = action.payload;
      })
      .addCase(editOperator.rejected, (state, action) => {
        state.isSaving = false;
        state.isError  = true;
        state.message  = action.payload;
      })

      /* changeOperatorStatus */
      .addCase(changeOperatorStatus.pending, (state) => {
        state.isSaving = true;
        state.isError  = false;
      })
      .addCase(changeOperatorStatus.fulfilled, (state, action) => {
        state.isSaving = false;
        const { operatorId, newStatus } = action.payload;
        const idx = state.operators.findIndex((o) => o.operatorId === operatorId);
        if (idx !== -1) state.operators[idx].status = newStatus;
      })
      .addCase(changeOperatorStatus.rejected, (state, action) => {
        state.isSaving = false;
        state.isError  = true;
        state.message  = action.payload;
      });
  },
});

export const { reset } = operatorsSlice.actions;
export default operatorsSlice.reducer;