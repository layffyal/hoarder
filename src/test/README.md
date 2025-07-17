# Follower/Following Feature Tests

This directory contains comprehensive tests for the follower/following functionality in the Hoarder application. The tests cover all aspects of the feature including searching, following, unfollowing, profile management, and privacy settings.

## Test Structure

```
src/test/
├── __mocks__/
│   └── followService.ts          # Mock service for testing
├── integration/
│   └── followerFlow.test.tsx     # Integration tests
├── Discover.test.tsx             # Component tests for Discover page
├── Profile.test.tsx              # Component tests for Profile page
├── followService.test.ts         # Unit tests for FollowService
├── setup.ts                      # Test setup and mocks
└── README.md                     # This file
```

## Test Categories

### 1. Unit Tests (`followService.test.ts`)
Tests the core business logic in the `FollowService` class:
- User feed retrieval
- Follower/following management
- Follow request handling
- User search functionality
- Profile management
- Privacy settings

### 2. Component Tests
- **Discover.test.tsx**: Tests the Discover page UI and interactions
- **Profile.test.tsx**: Tests the Profile page UI and interactions

### 3. Integration Tests (`integration/followerFlow.test.tsx`)
End-to-end tests that verify complete user flows:
- Complete follow flow for public users
- Complete follow flow for private users
- Profile privacy changes
- Follow request management
- Error recovery scenarios

## Running Tests

### Prerequisites
Make sure you have installed all dependencies:
```bash
npm install
```

### Available Test Commands

```bash
# Run all tests
npm run test:all

# Run unit tests only
npm run test:unit

# Run component tests only
npm run test:components

# Run integration tests only
npm run test:integration

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Running Specific Tests

```bash
# Run a specific test file
npm run test src/test/followService.test.ts

# Run tests matching a pattern
npm run test -- --grep "follow"

# Run tests with verbose output
npm run test -- --reporter=verbose
```

## Test Coverage

The tests cover the following functionality:

### Search Functionality
- ✅ User search by username/display name
- ✅ Search results display
- ✅ Empty search results handling
- ✅ Search error handling
- ✅ Loading states during search

### Follow Functionality
- ✅ Following public users (immediate acceptance)
- ✅ Following private users (pending requests)
- ✅ Unfollowing users
- ✅ Withdrawing follow requests
- ✅ Follow status display (none/pending/following)

### Profile Management
- ✅ Profile loading and display
- ✅ Profile updates (username, display name, bio, avatar)
- ✅ Privacy settings (public/private toggle)
- ✅ Follower/following count display
- ✅ Profile save functionality

### Follow Request Management
- ✅ Accepting incoming follow requests
- ✅ Rejecting incoming follow requests
- ✅ Viewing pending requests
- ✅ Managing outgoing requests

### Error Handling
- ✅ Network error recovery
- ✅ Authentication error handling
- ✅ Database error handling
- ✅ Graceful degradation

### UI/UX Testing
- ✅ Loading states
- ✅ Button states (disabled during actions)
- ✅ Tab navigation
- ✅ Empty state displays
- ✅ Success/error notifications

## Mock Data

The tests use comprehensive mock data to simulate real scenarios:

### User Profiles
```typescript
const mockUserProfile = {
  id: 'test-profile-id',
  user_id: 'test-user-id',
  username: 'testuser',
  display_name: 'Test User',
  bio: 'Test bio',
  avatar_url: 'https://example.com/avatar.jpg',
  is_private: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}
```

### Follow Relationships
```typescript
const mockFollower = {
  follower_id: 'follower-id',
  follower_username: 'follower',
  follower_display_name: 'Follower User',
  status: 'accepted',
  created_at: '2024-01-01T00:00:00Z',
}
```

## Test Scenarios

### Public User Follow Flow
1. User searches for a public user
2. User clicks "Follow" button
3. Follow is immediately accepted
4. User appears in "Following" tab
5. User can unfollow

### Private User Follow Flow
1. User searches for a private user
2. User clicks "Follow" button
3. Follow request is sent (pending status)
4. Request appears in "Pending" tab
5. User can withdraw request
6. Target user can accept/reject request

### Profile Privacy Changes
1. User changes profile from public to private
2. Profile saves successfully
3. Follow behavior changes for new followers
4. User changes profile back to public
5. Profile saves successfully

### Error Recovery
1. Network errors during search
2. Follow action failures
3. Profile save errors
4. Authentication errors

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: npm run test:all

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

## Debugging Tests

### Common Issues

1. **Mock not working**: Ensure mocks are properly set up in `setup.ts`
2. **Async test failures**: Use `waitFor()` for async operations
3. **Component not rendering**: Check if all required providers are mocked

### Debug Commands

```bash
# Run tests with debug output
npm run test -- --reporter=verbose

# Run specific failing test
npm run test -- --grep "should follow user"

# Run tests in watch mode for development
npm run test:watch
```

## Adding New Tests

When adding new follower/following functionality:

1. **Unit Tests**: Add to `followService.test.ts`
2. **Component Tests**: Add to appropriate component test file
3. **Integration Tests**: Add to `followerFlow.test.tsx`
4. **Update Mocks**: Add new mock data to `__mocks__/followService.ts`

### Test Naming Convention

```typescript
describe('Feature Name', () => {
  it('should do something when condition', async () => {
    // Test implementation
  })
})
```

## Performance Considerations

- Tests use isolated mocks to avoid database dependencies
- Async operations are properly handled with `waitFor()`
- Large test suites are split into logical groups
- Mock data is reused across tests for consistency

## Contributing

When contributing to the follower/following feature:

1. Write tests for new functionality
2. Ensure existing tests still pass
3. Update this README if adding new test categories
4. Follow the established patterns for mocking and assertions 