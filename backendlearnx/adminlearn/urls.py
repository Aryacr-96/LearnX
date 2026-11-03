from django.urls import path
from . import views

urlpatterns = [
    path('admin-login/', views.admin_login, name='admin-login'),
    
    
    path("blogs/", views.blog_list, name="blog-list"),
    path("blogs/<int:pk>/", views.blog_detail, name="blog-detail"),
    path("blogs/slug/<slug:slug>/",views.blog_detail_by_slug,name="blog-detail-by-slug",),


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

    path('technologies/', views.technology_list, name='technology-list'),
    path('technologies/<int:pk>/', views.technology_detail, name='technology-detail'),

    path('testimonials/', views.testimonial_list, name='testimonial-list'),
    path('testimonials/<int:pk>/', views.testimonial_detail, name='testimonial-detail'),

    path('hire-enquiries/', views.hire_enquiry_list, name='hire-enquiry-list'),
    path('hire-enquiries/<int:pk>/', views.hire_enquiry_detail, name='hire-enquiry-detail'),

    path('careers/', views.career_list, name='career-list'),
    path('careers/<int:pk>/', views.career_detail, name='career-detail'),
    path('careers/<int:pk>/apply/', views.apply_for_job, name='career-apply'),

    path('callbacks/', views.callback_list, name='callback-list'),
    path('callbacks/<int:pk>/', views.callback_detail, name='callback-detail'),

    path(
    "change-password/",
    views.change_password,
    name="change-password"
),
]