package com.bookwise.util;


public final class Constants {

    private Constants() {
    }

    public static final String API_VERSION = "v1";
    public static final String API_BASE_PATH = "/api";
    public static final String JWT_HEADER = "Authorization";
    public static final String JWT_TOKEN_PREFIX = "Bearer ";
    public static final long JWT_DEFAULT_EXPIRATION = 86400000L;
    public static final String JWT_CLAIM_AUTHORITIES = "authorities";
    public static final String JWT_CLAIM_USER_ID = "userId";

    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;
    public static final int MIN_PAGE_SIZE = 1;
    public static final String DEFAULT_SORT_DIRECTION = "DESC";
    public static final String DEFAULT_SORT_FIELD = "createdAt";

    public static final int MAX_TITLE_LENGTH = 500;
    public static final int MAX_AUTHOR_LENGTH = 255;
    public static final int MAX_PUBLISHER_LENGTH = 255;
    public static final int MAX_DESCRIPTION_LENGTH = 5000;
    public static final int MAX_COVER_IMAGE_URL_LENGTH = 1000;
    public static final int MAX_TAG_LENGTH = 100;
    public static final int MAX_TAGS_PER_BOOK = 3;
    public static final int MIN_TAGS_PER_BOOK = 0;
    public static final int MAX_SUMMARY_TEXT_LENGTH = 5000;
    public static final int MIN_SUMMARY_TEXT_LENGTH = 10;
    public static final int MIN_USERNAME_LENGTH = 3;
    public static final int MAX_USERNAME_LENGTH = 50;
    public static final int MIN_PASSWORD_LENGTH = 6;
    public static final int MAX_PASSWORD_LENGTH = 100;
    public static final int MAX_EMAIL_LENGTH = 100;
    public static final int MAX_FULL_NAME_LENGTH = 100;
    public static final String USERNAME_REGEX = "^[a-zA-Z0-9_]{3,50}$";
    public static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@(.+)$";

    public static final int DEFAULT_GOOGLE_BOOKS_RESULTS = 10;
    public static final int MAX_GOOGLE_BOOKS_RESULTS = 40;
    public static final int MIN_GOOGLE_BOOKS_RESULTS = 1;
    public static final String GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1";
    public static final String GOOGLE_BOOKS_VOLUMES_ENDPOINT = "/volumes";

    public static final int OPENAI_DEFAULT_MAX_TOKENS = 300;
    public static final int OPENAI_MIN_MAX_TOKENS = 50;
    public static final int OPENAI_MAX_MAX_TOKENS = 500;
    public static final double OPENAI_DEFAULT_TEMPERATURE = 0.7;
    public static final double OPENAI_MIN_TEMPERATURE = 0.0;
    public static final double OPENAI_MAX_TEMPERATURE = 1.0;
    public static final String OPENAI_DEFAULT_MODEL = "gpt-3.5-turbo";
    public static final String OPENAI_ROLE_SYSTEM = "system";
    public static final String OPENAI_ROLE_USER = "user";
    public static final String OPENAI_BASE_URL = "https://api.openai.com/v1";
    public static final String OPENAI_COMPLETIONS_ENDPOINT = "/chat/completions";

    public static final String BOOKS_CACHE = "books";
    public static final String SEARCH_CACHE = "search";
    public static final String TAGS_CACHE = "tags";
    public static final String USER_CACHE = "users";
    public static final String RECOMMENDATIONS_CACHE = "recommendations";
    public static final long CACHE_DEFAULT_TTL = 3600; // 1 hour in seconds
    public static final long SEARCH_CACHE_TTL = 1800; // 30 minutes in seconds

    public static final int DEFAULT_RECOMMENDATION_LIMIT = 3;
    public static final int MAX_RECOMMENDATION_LIMIT = 10;
    public static final int MIN_RECOMMENDATION_LIMIT = 1;
    public static final int MIN_SHARED_TAGS_FOR_RECOMMENDATION = 1;

    // User validation messages
    public static final String USERNAME_REQUIRED = "Username is required";
    public static final String USERNAME_LENGTH = "Username must be between 3 and 50 characters";
    public static final String USERNAME_PATTERN = "Username can only contain letters, numbers, and underscores";
    public static final String EMAIL_REQUIRED = "Email is required";
    public static final String EMAIL_INVALID = "Please provide a valid email address";
    public static final String PASSWORD_REQUIRED = "Password is required";
    public static final String PASSWORD_LENGTH = "Password must be between 6 and 100 characters";
    public static final String FULL_NAME_LENGTH = "Full name cannot exceed 100 characters";

    // Book validation messages
    public static final String BOOK_TITLE_REQUIRED = "Title is required";
    public static final String BOOK_TITLE_LENGTH = "Title cannot exceed 500 characters";
    public static final String BOOK_AUTHOR_LENGTH = "Author cannot exceed 255 characters";
    public static final String BOOK_PUBLISHER_LENGTH = "Publisher cannot exceed 255 characters";
    public static final String BOOK_DESCRIPTION_LENGTH = "Description cannot exceed 5000 characters";
    public static final String BOOK_TAGS_MAX = "Maximum 3 tags allowed";
    public static final String BOOK_TAG_LENGTH = "Tag cannot exceed 100 characters";

    // Summary validation messages
    public static final String SUMMARY_TEXT_REQUIRED = "Original text is required";
    public static final String SUMMARY_TEXT_LENGTH = "Original text must be between 10 and 5000 characters";

    public static final String SUCCESS_MESSAGE = "Operation completed successfully";
    public static final String CREATED_MESSAGE = "Resource created successfully";
    public static final String UPDATED_MESSAGE = "Resource updated successfully";
    public static final String DELETED_MESSAGE = "Resource deleted successfully";
    public static final String NOT_FOUND_MESSAGE = "Resource not found";
    public static final String UNAUTHORIZED_MESSAGE = "Unauthorized access";
    public static final String FORBIDDEN_MESSAGE = "Access forbidden";
    public static final String VALIDATION_ERROR_MESSAGE = "Validation failed";
    public static final String INTERNAL_SERVER_ERROR_MESSAGE = "Internal server error";
    public static final String SERVICE_UNAVAILABLE_MESSAGE = "External service unavailable";

    // Authentication errors
    public static final String INVALID_CREDENTIALS = "Invalid username or password";
    public static final String USER_NOT_FOUND = "User not found";
    public static final String USERNAME_ALREADY_EXISTS = "Username is already taken!";
    public static final String EMAIL_ALREADY_EXISTS = "Email address is already in use!";
    public static final String JWT_TOKEN_EXPIRED = "JWT token has expired";
    public static final String JWT_TOKEN_INVALID = "Invalid JWT token";
    public static final String ACCESS_DENIED = "Access Denied - Invalid or Missing JWT Token";

    // Book errors
    public static final String BOOK_NOT_FOUND = "Book not found";
    public static final String BOOK_ALREADY_EXISTS = "Book already exists in your library";
    public static final String BOOK_ACCESS_DENIED = "You can only access your own books";

    // External API errors
    public static final String GOOGLE_BOOKS_API_ERROR = "Failed to search books from Google Books API";
    public static final String OPENAI_API_ERROR = "Failed to generate summary using OpenAI API";
    public static final String EXTERNAL_API_TIMEOUT = "External API request timeout";
    public static final String EXTERNAL_API_QUOTA_EXCEEDED = "API quota exceeded";

    public static final String ROLE_USER = "ROLE_USER";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String AUTHORITY_READ = "READ";
    public static final String AUTHORITY_WRITE = "WRITE";
    public static final String AUTHORITY_DELETE = "DELETE";
    public static final int BCRYPT_STRENGTH = 10;

    public static final String AI_PROVIDER_OPENAI = "openai";
    public static final String AI_PROVIDER_GEMINI = "gemini";
    public static final String AI_PROVIDER_CLAUDE = "claude";

    public static final String[] POPULAR_TAGS = {
            "fiction", "non-fiction", "mystery", "romance", "sci-fi", "fantasy",
            "biography", "history", "self-help", "business", "technology", "health",
            "cooking", "travel", "art", "poetry", "drama", "thriller", "horror",
            "young-adult", "children", "education", "religion", "philosophy",
            "science", "mathematics", "engineering", "psychology", "sociology",
            "politics", "economics", "adventure", "classic", "contemporary",
            "dystopian", "utopian", "magical-realism", "literary-fiction",
            "historical-fiction", "crime", "detective", "espionage", "war",
            "memoir", "autobiography", "true-crime", "sports", "music"
    };

    public static final String DEFAULT_TIMEZONE = "UTC";
    public static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd";
    public static final String DEFAULT_DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss'Z'";
    public static final String DEFAULT_TIME_FORMAT = "HH:mm:ss";
    public static final String DEFAULT_BOOK_COVER = "/images/default-book-cover.png";
    public static final String DEFAULT_USER_AVATAR = "/images/default-avatar.png";
    public static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    public static final String[] ALLOWED_IMAGE_TYPES = {"jpg", "jpeg", "png", "gif"};

    public static final String LOG_REQUEST_START = "Request started: {} {}";
    public static final String LOG_REQUEST_END = "Request completed: {} {} - Status: {} - Duration: {}ms";
    public static final String LOG_USER_LOGIN = "User login: {}";
    public static final String LOG_USER_LOGOUT = "User logout: {}";
    public static final String LOG_USER_REGISTER = "User registered: {}";
    public static final String LOG_BOOK_ADDED = "Book added: {} by user: {}";
    public static final String LOG_BOOK_DELETED = "Book deleted: {} by user: {}";
    public static final String LOG_SUMMARY_GENERATED = "Summary generated for book: {} by user: {}";
    public static final String LOG_RECOMMENDATION_REQUEST = "Recommendations requested for book: {} by user: {}";

    public static final String ISBN_10_PATTERN = "^(?:\\d{9}X|\\d{10})$";
    public static final String ISBN_13_PATTERN = "^\\d{13}$";
    public static final String UUID_PATTERN = "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$";
    public static final String URL_PATTERN = "^https?://[^\\s/$.?#].[^\\s]*$";
    public static final String ENV_DEVELOPMENT = "development";
    public static final String ENV_TESTING = "testing";
    public static final String ENV_STAGING = "staging";
    public static final String ENV_PRODUCTION = "production";

    public static final int RATE_LIMIT_REQUESTS_PER_MINUTE = 60;
    public static final int RATE_LIMIT_REQUESTS_PER_HOUR = 1000;
    public static final int RATE_LIMIT_REQUESTS_PER_DAY = 10000;
}
