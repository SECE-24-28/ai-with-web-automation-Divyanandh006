# Testing Checklist

Use this checklist to verify everything works correctly after starting the application.

## Prerequisites ✅
- [ ] Python 3.8+ installed
- [ ] Node.js 14+ installed
- [ ] `best_model.h5` exists in project root
- [ ] Internet connection

## Backend Startup ✅

### Step 1: Start Backend
- [ ] Run `python backend/main.py`
- [ ] See message: "✓ Model loaded successfully"
- [ ] See message: "Uvicorn running on http://0.0.0.0:8000"

### Step 2: Test Backend Health
```bash
curl http://localhost:8000/health
```
Expected: `{"status": "healthy", ...}`
- [ ] Response is successful
- [ ] Status code is 200

### Step 3: Get Model Info
```bash
curl http://localhost:8000/api/model-info
```
- [ ] Response shows model metadata
- [ ] Input and output shapes are present
- [ ] Number of layers is displayed

## Frontend Startup ✅

### Step 1: Start Frontend
- [ ] Run `npm start` in frontend directory
- [ ] Browser automatically opens to http://localhost:3000
- [ ] Page loads without errors

### Step 2: Check UI Elements
- [ ] Page title shows "ML Model Prediction Interface"
- [ ] Two tabs visible: "Predict" and "Model Info"
- [ ] Input form is visible on Predict tab
- [ ] Buttons are visible: "Random Values", "Clear", "Get Prediction"

### Step 3: Check Model Info Tab
- [ ] Click "Model Info" tab
- [ ] See model information displayed
- [ ] See input/output shapes
- [ ] See number of layers
- [ ] "Refresh" button is visible

## API Testing ✅

### Test 1: Get Model Information
- [ ] Navigate to http://localhost:8000/docs (Swagger UI)
- [ ] Click on GET /api/model-info
- [ ] Click "Try it out" button
- [ ] Click "Execute" button
- [ ] Response shows model information

### Test 2: Single Prediction
From Swagger UI:
- [ ] Click POST /api/predict
- [ ] Click "Try it out"
- [ ] Enter test data: `{"input_data": [1.0, 2.0, 3.0, 4.0, 5.0]}`
- [ ] Click "Execute"
- [ ] Response shows predictions

From Frontend:
- [ ] Enter values in prediction form
- [ ] Click "Get Prediction"
- [ ] Wait for response
- [ ] Result displays with predictions

### Test 3: Random Prediction
- [ ] Click "Random Values" button
- [ ] Form fills with random numbers
- [ ] Click "Get Prediction"
- [ ] Prediction returns successfully

### Test 4: Batch Predictions
From Swagger UI:
- [ ] Click POST /api/predict-batch
- [ ] Enter batch data
- [ ] Execute request
- [ ] Multiple predictions returned

## Frontend Functionality ✅

### Test 1: Form Interaction
- [ ] Can type in input fields
- [ ] "Clear" button clears all fields
- [ ] "Random Values" button fills fields
- [ ] Can manually enter values

### Test 2: Prediction Results
- [ ] Results display with correct format
- [ ] Confidence scores shown
- [ ] Progress bars visible
- [ ] Statistical summary displayed

### Test 3: Tab Switching
- [ ] Can switch between tabs
- [ ] Content updates correctly
- [ ] State is maintained

### Test 4: Responsiveness
- [ ] Resize browser window
- [ ] Layout adapts (mobile, tablet, desktop)
- [ ] All elements remain accessible

## Error Handling ✅

### Test 1: Invalid Input
- [ ] Enter non-numeric values (if applicable)
- [ ] Submit with incomplete data
- [ ] Error message displays gracefully

### Test 2: Backend Down
- [ ] Stop backend server
- [ ] Try to make prediction from frontend
- [ ] Error message shown
- [ ] Frontend doesn't crash

### Test 3: Network Issues
- [ ] Throttle network in browser DevTools
- [ ] Try slow 3G
- [ ] Verify loading spinner shows
- [ ] Request eventually completes

## Performance Testing ✅

### Test 1: Response Time
- [ ] Make prediction
- [ ] Note response time (should be < 2 seconds)
- [ ] Make multiple predictions
- [ ] Check frontend responsiveness

### Test 2: Large Batch
- [ ] Submit batch with 100+ items (if supported)
- [ ] Verify processing handles load
- [ ] Check memory usage

## Browser Compatibility ✅

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on macOS)

## Docker Testing ✅

### If Using Docker
- [ ] Run `docker-compose up`
- [ ] Both backend and frontend containers start
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend accessible at http://localhost:8000
- [ ] Models can access container files
- [ ] Run `docker-compose down` to stop

## Final Checks ✅

### Security
- [ ] No sensitive data in console logs
- [ ] API errors don't expose system info
- [ ] CORS is properly configured

### Documentation
- [ ] README.md is accessible
- [ ] QUICKSTART.md is clear
- [ ] Examples in examples/ are runnable
- [ ] API docs auto-generated correctly

### Code Quality
- [ ] No console errors in browser
- [ ] No Python exceptions in backend
- [ ] Proper error handling throughout
- [ ] Code is properly formatted

## Sign-Off ✅

When all checks pass:

- [ ] Backend working ✅
- [ ] Frontend working ✅
- [ ] API endpoints functional ✅
- [ ] Predictions accurate ✅
- [ ] UI responsive ✅
- [ ] Documentation complete ✅
- [ ] Error handling proper ✅
- [ ] Performance acceptable ✅

**Status**: Ready for Deployment! 🚀

---

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Model not found | Ensure best_model.h5 in root |
| Port in use | Change port in config |
| Cannot connect | Check both servers running |
| CORS error | Verify frontend URL in backend |
| Prediction fails | Check input data format |
| Frontend blank | Check browser console for errors |
| Slow predictions | Check model size and hardware |

---

**Last Updated**: December 2024
