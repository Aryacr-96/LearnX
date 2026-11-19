from django.db import models
from ckeditor.fields import RichTextField
from django.utils.text import slugify
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    ROLE_CHOICES = (
        ("admin", "Admin"),       # existing superuser
        ("subadmin", "Sub Admin"),
        ("user", "User"),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="user")
    phone = models.CharField(max_length=20, blank=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="created_profiles",
    )
    must_change_password = models.BooleanField(default=True) # 👈 ADD THIS
    created_at = models.DateTimeField(auto_now_add=True)
    

    # Module permissions
    can_manage_blogs        = models.BooleanField(default=False)
    can_manage_gallery      = models.BooleanField(default=False)
    can_manage_courses      = models.BooleanField(default=False)
    can_manage_placements   = models.BooleanField(default=False)
    can_manage_team         = models.BooleanField(default=False)
    can_manage_technologies = models.BooleanField(default=False)
    can_manage_testimonials = models.BooleanField(default=False)
    can_manage_careers      = models.BooleanField(default=False)
    can_view_contacts       = models.BooleanField(default=False)
    can_view_hire_enquiries = models.BooleanField(default=False)
    can_view_callbacks      = models.BooleanField(default=False)
    can_manage_pages        = models.BooleanField(default=False) # NEW

    def __str__(self):
        return f"{self.user.username} ({self.role})"


MODULE_PERMISSIONS = {
    "blogs":          "can_manage_blogs",
    "gallery":        "can_manage_gallery",
    "courses":        "can_manage_courses",
    "placements":     "can_manage_placements",
    "team":           "can_manage_team",
    "technologies":   "can_manage_technologies",
    "testimonials":   "can_manage_testimonials",
    "careers":        "can_manage_careers",
    "contacts":       "can_view_contacts",
    "hire_enquiries": "can_view_hire_enquiries",
    "callbacks":      "can_view_callbacks",
    "pages":          "can_manage_pages", # NEW
}


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        role = "admin" if instance.is_superuser else "user"
        UserProfile.objects.create(user=instance, role=role)


class Blog(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, null=True, blank=True)
    image = models.ImageField(upload_to='blog_images/', blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    views = models.PositiveIntegerField(default=0)
    description = RichTextField()

    class Meta:
        ordering = ['-uploaded_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or "blog"
            new_slug = base_slug
            counter = 1
            while Blog.objects.filter(slug=new_slug).exclude(pk=self.pk).exists():
                new_slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = new_slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Gallery(models.Model):
    title = models.CharField(max_length=200)
    image = models.ImageField(upload_to="gallery_images/", blank=True, null=True)
    video = models.FileField(upload_to="gallery_videos/", blank=True, null=True)
    youtube_url = models.URLField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]
        verbose_name_plural = "Gallery"

    def __str__(self):
        return self.title


class ContactMessage(models.Model):
    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-submitted_at"]
        verbose_name_plural = "Contact Messages"

    def __str__(self):
        return f"{self.full_name} - {self.subject}"


class PlacementStudent(models.Model):
    name = models.CharField(max_length=150)
    role = models.CharField(max_length=200)
    batch = models.CharField(max_length=50)
    image = models.ImageField(upload_to='placements/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


class TeamMember(models.Model):
    name = models.CharField(max_length=150)
    role = models.CharField(max_length=150)
    bio = models.TextField()
    image = models.ImageField(upload_to='team_images/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


class Course(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    image = models.ImageField(upload_to='courses/', blank=True, null=True)
    duration = models.CharField(max_length=50, help_text="e.g., 1h 35m")
    level = models.CharField(max_length=50, default="Beginner")
    description = models.TextField(help_text="Short summary for the course card")
    overview = RichTextField(help_text="Full course overview (CKEditor)")
    modules = models.JSONField(default=list, blank=True, help_text="Add modules as a list of JSON objects.")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Course.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Technology(models.Model):
    title = models.CharField(max_length=100)
    image = models.ImageField(upload_to='technologies/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name_plural = "Technologies"

    def __str__(self):
        return self.title


class Testimonial(models.Model):
    name = models.CharField(max_length=150)
    message = models.TextField(help_text="The testimonial text")
    image = models.ImageField(upload_to='testimonials/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name_plural = "Testimonials"

    def __str__(self):
        return self.name


class HireEnquiry(models.Model):
    company_name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    job_roles = models.JSONField(default=list, help_text="List of job roles")
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-submitted_at"]
        verbose_name_plural = "Hire Enquiries"

    def __str__(self):
        return f"{self.company_name} - {self.contact_person}"


class Career(models.Model):
    category = models.CharField(max_length=150, help_text="e.g. Business Development")
    title = models.CharField(max_length=200)
    experience = models.CharField(max_length=100, help_text="e.g. 4+ Years of experience")
    description = RichTextField(help_text="Job description")
    responsibilities = RichTextField(help_text="Key responsibilities")
    requirements = RichTextField(help_text="Requirements")
    order = models.PositiveIntegerField(default=0)
    applications = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name_plural = "Careers"

    def __str__(self):
        return f"{self.title} ({self.category})"


class CallbackRequest(models.Model):
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-submitted_at"]
        verbose_name_plural = "Callback Requests"

    def __str__(self):
        return f"{self.name} - {self.phone}"


# ===========================================================================
# PAGE SEO MODEL
# ===========================================================================
class PageSEO(models.Model):
    PAGE_CHOICES = (
        ("home", "Home Page"),
        ("about", "About Us"),
        ("career", "Careers Page"),
        ("course", "Courses Page"),
        ("blog", "Blog Page"),
        ("gallery", "Gallery Page"),
        ("placements", "Placements Page"),
        ("hire", "Hire Page"),
        ("contact", "Contact Page"),
    )

    page_name = models.CharField(max_length=50, choices=PAGE_CHOICES, unique=True)
    meta_title = models.CharField(max_length=60, blank=True, help_text="SEO Title (max 60 chars)")
    meta_description = models.CharField(max_length=160, blank=True, help_text="SEO Description (max 160 chars)")
    meta_keywords = models.CharField(max_length=255, blank=True, help_text="Comma separated keywords")
    canonical_url = models.URLField(blank=True, help_text="Canonical URL (optional)")
    social_preview_image = models.ImageField(upload_to='seo_previews/', blank=True, null=True, help_text="Image for social sharing (OG Image)")

    class Meta:
        verbose_name_plural = "Page SEO Settings"

    def __str__(self):
        return self.get_page_name_display()






# ===========================================================================
# SITE SETTINGS MODEL
# ===========================================================================


class SiteSettings(models.Model):
    institute_name = models.CharField(max_length=255, default="LearnX")
    email = models.EmailField(default="contact@learnx.com")
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    working_hours = models.CharField(
        max_length=255,
        default="Mon-Fri: 9AM - 5PM"
    )

    google_map_url = models.URLField(max_length=1000, blank=True, null=True)

    # Social Media Links
    facebook_url = models.URLField(blank=True, null=True)
    instagram_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    youtube_url = models.URLField(blank=True, null=True)
    whatsapp_url = models.URLField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Site Settings"

    def __str__(self):
        return self.institute_name
