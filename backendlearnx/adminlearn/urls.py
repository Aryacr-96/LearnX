from django.urls import path
from . import views
from . import user_views

urlpatterns = [
    path('admin-login/', views.admin_login, name='admin-login'),

    # ---------------------------------------------------------------
    # Admin user management (admin only)
    # ---------------------------------------------------------------
    path("me/", views.whoami, name="whoami"),
    
    # 👇 CHANGED THESE FROM 'views' TO 'user_views'
    path("admin/create-subadmin/", user_views.create_sub_admin, name="create-subadmin"),
    path("admin/create-user/", user_views.create_user, name="create-user"),
    path("admin/users/", user_views.list_managed_users, name="list-managed-users"),
    path("admin/users/<int:pk>/toggle/", user_views.toggle_user_active, name="toggle-user-active"),
    path(
        "admin/subadmins/<int:pk>/permissions/",
        user_views.update_subadmin_permissions,
        name="update-subadmin-permissions",
    ),
    
    # 👇 THIS IS NOW CORRECTLY PLACED
    path("admin/users/<int:pk>/delete/", user_views.delete_managed_user, name="delete-managed-user"),
    
    # 👇 NEW: Page SEO Route
    path("admin/page-seo/", views.page_seo_list, name="page-seo-list"),

    # ---------------------------------------------------------------
    # Content modules
    # ---------------------------------------------------------------
    path("blogs/", views.blog_list, name="blog-list"),
    path("blogs/<int:pk>/", views.blog_detail, name="blog-detail"),
    path("blogs/slug/<slug:slug>/", views.blog_detail_by_slug, name="blog-detail-by-slug"),

    path("gallery/", views.gallery_list, name="gallery-list"),
    path("gallery/<int:pk>/", views.gallery_detail, name="gallery-detail"),

    path("contact/", views.contact_list, name="contact-list"),
    path("contact/<int:pk>/", views.contact_detail, name="contact-detail"),

    path("placements/", views.placement_list, name="placement-list"),
    path("placements/<int:pk>/", views.placement_detail, name="placement-detail"),

    path("team/", views.team_list, name="team-list"),
    path("team/<int:pk>/", views.team_detail, name="team-detail"),

    path("courses/", views.course_list, name="course-list"),
    path("courses/<int:pk>/", views.course_detail, name="course-detail"),
    path("courses/slug/<slug:slug>/", views.course_detail_by_slug, name="course-detail-by-slug"),

    path("technologies/", views.technology_list, name="technology-list"),
    path("technologies/<int:pk>/", views.technology_detail, name="technology-detail"),

    path("testimonials/", views.testimonial_list, name="testimonial-list"),
    path("testimonials/<int:pk>/", views.testimonial_detail, name="testimonial-detail"),

    path("hire-enquiries/", views.hire_enquiry_list, name="hire-enquiry-list"),
    path("hire-enquiries/<int:pk>/", views.hire_enquiry_detail, name="hire-enquiry-detail"),

    path("careers/", views.career_list, name="career-list"),
    path("careers/<int:pk>/", views.career_detail, name="career-detail"),
    path("careers/<int:pk>/apply/", views.apply_for_job, name="career-apply"),

    path("callbacks/", views.callback_list, name="callback-list"),
    path("callbacks/<int:pk>/", views.callback_detail, name="callback-detail"),

    path("change-password/", views.change_password, name="change-password"),

    path('settings/', views.SiteSettingsView.as_view(), name='site-settings'),
]