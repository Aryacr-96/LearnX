fieldsets = (
    ('Blog Content', {
        'fields': ('title', 'image', 'description'),
    }),
    ('SEO Meta Tags', {
        'fields': (
            'meta_title',
            'meta_description',
            'meta_keywords',
        ),
    }),
    ('Publishing Information', {
        'fields': ('uploaded_at', 'views'),
    }),
)