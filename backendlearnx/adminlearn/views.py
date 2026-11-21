import uuid
import secrets
import string
from datetime import datetime

from django.contrib.auth.models import User
from django.db.models import F
from django.core.files.storage import default_storage
from django.conf import settings

from .models import PageSEO
from .serializers import PageSEOSerializer

from rest_framework.decorators import (
    api_view,
    parser_classes,
    authentication_classes,
    permission_classes,
)
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token

from .models import (
    Blog, CallbackRequest, Career, ContactMessage, Course, Gallery,
    HireEnquiry, PlacementStudent, TeamMember, Technology, Testimonial,
    MODULE_PERMISSIONS,
)
from .serializers import (
    BlogSerializer, CallbackRequestSerializer, GallerySerializer,
    ContactMessageSerializer, PlacementStudentSerializer,
    TeamMemberSerializer, CourseSerializer, TechnologySerializer,
    TestimonialSerializer, HireEnquirySerializer, CareerSerializer,
)
from .permissions import (
    get_role,
    is_admin_user,
    has_module_permission,
    require_admin,
    require_module,
)
from .user_serializers import (
    ManagedUserSerializer,
    CreateSubAdminSerializer,
    CreateUserSerializer,
    SubAdminPermissionsSerializer,
)
from .utils import send_credentials_email


# ---------------------------------------------------------------------------
# Shared helper
# ---------------------------------------------------------------------------
def _is_admin(request):
    """Admin or subadmin — anyone allowed into the panel."""
    return is_admin_user(request.user)


def _gen_password(n=10):
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(n))


def _role_payload(user):
    """Build role + permissions dict for a user."""
    role = get_role(user)
    if role == "admin":
        perms = {k: True for k in MODULE_PERMISSIONS}
    elif role == "subadmin":
        perms = {k: getattr(user.profile, f, False) for k, f in MODULE_PERMISSIONS.items()}
    else:
        perms = {}
    return role, perms

from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User

# ... other imports ...

@api_view(["POST"])
@authentication_classes([]) # No token needed for login
@permission_classes([AllowAny])
def admin_login(request):
    identifier = request.data.get("email", "").strip() # frontend sends 'email' key
    password = request.data.get("password", "")

    if not identifier or not password:
        return Response(
            {"detail": "Email and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Try to find the user by email or username
    user_obj = User.objects.filter(email__iexact=identifier).first() or \
               User.objects.filter(username__iexact=identifier).first()

    if not user_obj:
        return Response(
            {"detail": "Invalid credentials."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Authenticate
    user = authenticate(username=user_obj.username, password=password)

    if not user:
        return Response(
            {"detail": "Invalid credentials."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_active:
        return Response(
            {"detail": "This account is disabled."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Check role
    role = "admin" if user.is_superuser else getattr(getattr(user, "profile", None), "role", "user")
    
    if role not in ("admin", "subadmin"):
        return Response(
            {"detail": "You do not have permission to access the admin panel."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Get or create token
    token, _ = Token.objects.get_or_create(user=user)

    # Get permissions
    perms = {}
    if role == "admin":
        from .models import MODULE_PERMISSIONS
        perms = {k: True for k in MODULE_PERMISSIONS}
    elif role == "subadmin":
        from .models import MODULE_PERMISSIONS
        perms = {k: getattr(user.profile, flag, False) for k, flag in MODULE_PERMISSIONS.items()}

    # 👇 GET THE MUST_CHANGE_PASSWORD FLAG HERE
    must_change = getattr(getattr(user, "profile", None), "must_change_password", False)

    return Response({
        "token": token.key,
        "username": user.username,
        "email": user.email,
        "name": user.first_name or user.username,
        "role": role,
        "permissions": perms,
        "must_change_password": must_change, # 👈 ADD THIS
    }, status=status.HTTP_200_OK)
# ===========================================================================
# BLOGS
# ===========================================================================
@api_view(["GET", "POST"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def blog_list(request): # 👈 Removed @require_module("blogs")
    if request.method == "GET":
        blogs = Blog.objects.all()
        serializer = BlogSerializer(blogs, many=True, context={"request": request})
        return Response(serializer.data)

    # 👇 Only check permissions for POST
    if not _is_admin(request) or not has_module_permission(request.user, "blogs"):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    serializer = BlogSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def blog_detail(request, pk): # 👈 Removed @require_module("blogs")
    try:
        blog = Blog.objects.get(pk=pk)
    except Blog.DoesNotExist:
        return Response({"error": "Blog not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        Blog.objects.filter(pk=pk).update(views=F("views") + 1)
        blog.refresh_from_db(fields=["views"])
        serializer = BlogSerializer(blog, context={"request": request})
        return Response(serializer.data)

    # 👇 Only check permissions for PUT/PATCH/DELETE
    if not _is_admin(request) or not has_module_permission(request.user, "blogs"):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    if request.method in ["PUT", "PATCH"]:
        serializer = BlogSerializer(
            blog, data=request.data,
            partial=(request.method == "PATCH"),
            context={"request": request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    blog.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([AllowAny])
def blog_detail_by_slug(request, slug):
    try:
        blog = Blog.objects.get(slug=slug)
    except Blog.DoesNotExist:
        return Response({"error": "Blog not found"}, status=status.HTTP_404_NOT_FOUND)

    Blog.objects.filter(pk=blog.pk).update(views=F("views") + 1)
    blog.refresh_from_db(fields=["views"])
    serializer = BlogSerializer(blog, context={"request": request})
    return Response(serializer.data)
# ===========================================================================
# GALLERY
# ===========================================================================
@api_view(["GET", "POST"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def gallery_list(request): # 👈 Removed @require_module("gallery")
    if request.method == "GET":
        items = Gallery.objects.all()
        serializer = GallerySerializer(items, many=True, context={"request": request})
        return Response(serializer.data)

    # 👇 Only check permissions for POST
    if not _is_admin(request) or not has_module_permission(request.user, "gallery"):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    serializer = GallerySerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def gallery_detail(request, pk): # 👈 Removed @require_module("gallery")
    try:
        item = Gallery.objects.get(pk=pk)
    except Gallery.DoesNotExist:
        return Response({"error": "Gallery image not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = GallerySerializer(item, context={"request": request})
        return Response(serializer.data)

    # 👇 Only check permissions for PUT/PATCH/DELETE
    if not _is_admin(request) or not has_module_permission(request.user, "gallery"):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    if request.method in ["PUT", "PATCH"]:
        serializer = GallerySerializer(
            item, data=request.data,
            partial=(request.method == "PATCH"),
            context={"request": request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    item.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# ===========================================================================
# CONTACT
# ===========================================================================
@api_view(["GET", "POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def contact_list(request):
    if request.method == "POST":
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Message sent successfully."},
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 👇 Return empty list for public/non-permitted users instead of 403
    if not _is_admin(request) or not has_module_permission(request.user, "contacts"):
        return Response([])

    messages = ContactMessage.objects.all()
    serializer = ContactMessageSerializer(messages, many=True)
    return Response(serializer.data)


@api_view(["DELETE", "PATCH"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def contact_detail(request, pk):
    # 👇 Keep this secure: Only admins with permission can edit/delete
    if not _is_admin(request) or not has_module_permission(request.user, "contacts"):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    try:
        msg = ContactMessage.objects.get(pk=pk)
    except ContactMessage.DoesNotExist:
        return Response({"error": "Message not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "PATCH":
        msg.is_read = request.data.get("is_read", msg.is_read)
        msg.save()
        return Response({"status": "updated"})

    msg.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# ===========================================================================
# PLACEMENTS
# ===========================================================================
@api_view(["GET", "POST"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def placement_list(request): # 👈 Removed @require_module("placements")
    if request.method == "GET":
        students = PlacementStudent.objects.all()
        serializer = PlacementStudentSerializer(students, many=True, context={"request": request})
        return Response(serializer.data)

    # 👇 Only check permissions for POST
    if not _is_admin(request) or not has_module_permission(request.user, "placements"):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    serializer = PlacementStudentSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT", "PATCH", "DELETE"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def placement_detail(request, pk): # 👈 Removed @require_module("placements")
    try:
        student = PlacementStudent.objects.get(pk=pk)
    except PlacementStudent.DoesNotExist:
        return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

    # 👇 Only check permissions for PUT/PATCH/DELETE
    if not _is_admin(request) or not has_module_permission(request.user, "placements"):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    if request.method in ["PUT", "PATCH"]:
        serializer = PlacementStudentSerializer(
            student, data=request.data,
            partial=(request.method == "PATCH"),
            context={"request": request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    student.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# ===========================================================================
# TEAM
# ===========================================================================
@api_view(["GET", "POST"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def team_list(request): # 👈 Removed @require_module("team")
    if request.method == "GET":
        members = TeamMember.objects.all()
        serializer = TeamMemberSerializer(members, many=True, context={"request": request})
        return Response(serializer.data)

    # 👇 Only check permissions for POST
    if not _is_admin(request) or not has_module_permission(request.user, "team"):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    serializer = TeamMemberSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT", "PATCH", "DELETE"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def team_detail(request, pk): # 👈 Removed @require_module("team")
    try:
        member = TeamMember.objects.get(pk=pk)
    except TeamMember.DoesNotExist:
        return Response({"error": "Team member not found"}, status=status.HTTP_404_NOT_FOUND)

    # 👇 Only check permissions for PUT/PATCH/DELETE
    if not _is_admin(request) or not has_module_permission(request.user, "team"):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    if request.method in ["PUT", "PATCH"]:
        serializer = TeamMemberSerializer(
            member, data=request.data,
            partial=(request.method == "PATCH"),
            context={"request": request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    member.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# ===========================================================================
# COURSES
# ===========================================================================
@api_view(["GET", "POST"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def course_list(request): # 👈 Removed @require_module("courses")
    if request.method == "GET":
        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True, context={"request": request})
        return Response(serializer.data)

    # 👇 Only check permissions for POST
    if not _is_admin(request) or not has_module_permission(request.user, "courses"):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    serializer = CourseSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def course_detail(request, pk): # 👈 Removed @require_module("courses")
    try:
        course = Course.objects.get(pk=pk)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = CourseSerializer(course, context={"request": request})
        return Response(serializer.data)

    # 👇 Only check permissions for PUT/PATCH/DELETE
    if not _is_admin(request) or not has_module_permission(request.user, "courses"):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    if request.method in ["PUT", "PATCH"]:
        serializer = CourseSerializer(
            course, data=request.data,
            partial=(request.method == "PATCH"),
            context={"request": request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    course.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([AllowAny])
def course_detail_by_slug(request, slug):
    try:
        course = Course.objects.get(slug=slug)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = CourseSerializer(course, context={"request": request})
    return Response(serializer.data)
# ===========================================================================
# TECHNOLOGIES
# ===========================================================================
@api_view(["GET", "POST"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def technology_list(request): # 👈 Removed @require_module("technologies")
    if request.method == "GET":
        technologies = Technology.objects.all()
        serializer = TechnologySerializer(technologies, many=True, context={"request": request})
        return Response(serializer.data)

    # 👇 Only check permissions for POST
    if not _is_admin(request) or not has_module_permission(request.user, "technologies"):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    serializer = TechnologySerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT", "PATCH", "DELETE"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def technology_detail(request, pk): # 👈 Removed @require_module("technologies")
    try:
        tech = Technology.objects.get(pk=pk)
    except Technology.DoesNotExist:
        return Response({"error": "Technology not found"}, status=status.HTTP_404_NOT_FOUND)

    # 👇 Only check permissions for PUT/PATCH/DELETE
    if not _is_admin(request) or not has_module_permission(request.user, "technologies"):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    if request.method in ["PUT", "PATCH"]:
        serializer = TechnologySerializer(
            tech, data=request.data,
            partial=(request.method == "PATCH"),
            context={"request": request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    tech.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)



# ===========================================================================
# TESTIMONIALS
# ===========================================================================
@api_view(["GET", "POST"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def testimonial_list(request): # 👈 Removed @require_module("testimonials")
    if request.method == "GET":
        testimonials = Testimonial.objects.all()
        serializer = TestimonialSerializer(testimonials, many=True, context={"request": request})
        return Response(serializer.data)

    # 👇 Only check permissions for POST
    if not _is_admin(request) or not has_module_permission(request.user, "testimonials"):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    serializer = TestimonialSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT", "PATCH", "DELETE"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def testimonial_detail(request, pk): # 👈 Removed @require_module("testimonials")
    try:
        testimonial = Testimonial.objects.get(pk=pk)
    except Testimonial.DoesNotExist:
        return Response({"error": "Testimonial not found"}, status=status.HTTP_404_NOT_FOUND)

    # 👇 Only check permissions for PUT/PATCH/DELETE
    if not _is_admin(request) or not has_module_permission(request.user, "testimonials"):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    if request.method in ["PUT", "PATCH"]:
        serializer = TestimonialSerializer(
            testimonial, data=request.data,
            partial=(request.method == "PATCH"),
            context={"request": request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    testimonial.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ===========================================================================
# HIRE ENQUIRIES
# ===========================================================================
@api_view(["GET", "POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def hire_enquiry_list(request):
    if request.method == "POST":
        serializer = HireEnquirySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Enquiry submitted successfully."},
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if not _is_admin(request) or not has_module_permission(request.user, "hire_enquiries"):
        return Response({"detail": "Permission denied."},
                        status=status.HTTP_403_FORBIDDEN)

    enquiries = HireEnquiry.objects.all()
    serializer = HireEnquirySerializer(enquiries, many=True)
    return Response(serializer.data)


@api_view(["DELETE", "PATCH"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
@require_module("hire_enquiries")
def hire_enquiry_detail(request, pk):
    try:
        enquiry = HireEnquiry.objects.get(pk=pk)
    except HireEnquiry.DoesNotExist:
        return Response({"error": "Enquiry not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "PATCH":
        enquiry.is_read = request.data.get("is_read", enquiry.is_read)
        enquiry.save()
        return Response({"status": "updated"})

    enquiry.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
# ===========================================================================
# CAREERS
# ===========================================================================
@api_view(["GET", "POST"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def career_list(request): # 👈 Removed @require_module("careers")
    if request.method == "GET":
        careers = Career.objects.all()
        serializer = CareerSerializer(careers, many=True)
        return Response(serializer.data)

    # 👇 Only check permissions for POST
    if not _is_admin(request) or not has_module_permission(request.user, "careers"):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    serializer = CareerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT", "PATCH", "DELETE"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def career_detail(request, pk): # 👈 Removed @require_module("careers")
    try:
        career = Career.objects.get(pk=pk)
    except Career.DoesNotExist:
        return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

    # 👇 Only check permissions for PUT/PATCH/DELETE
    if not _is_admin(request) or not has_module_permission(request.user, "careers"):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    if request.method in ["PUT", "PATCH"]:
        serializer = CareerSerializer(
            career, data=request.data,
            partial=(request.method == "PATCH"),
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    career.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([])
@permission_classes([AllowAny])
def apply_for_job(request, pk):
    try:
        career = Career.objects.get(pk=pk)
    except Career.DoesNotExist:
        return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

    application_data = {
        "id": str(uuid.uuid4()),
        "name": request.data.get("name"),
        "email": request.data.get("email"),
        "address": request.data.get("address"),
        "contact_number": request.data.get("contact_number"),
        "experience": request.data.get("experience"),
        "qualification": request.data.get("qualification"),
        "applied_at": datetime.now().isoformat(),
        "resume_url": None,
    }

    if "resume" in request.FILES:
        resume_file = request.FILES["resume"]
        file_name = f"resumes/{uuid.uuid4()}_{resume_file.name}"
        saved_path = default_storage.save(file_name, resume_file)
        application_data["resume_url"] = f"{settings.MEDIA_URL}{saved_path}"

    current_apps = career.applications or []
    current_apps.append(application_data)
    career.applications = current_apps
    career.save()

    return Response({"message": "Application submitted successfully."},
                    status=status.HTTP_201_CREATED)


# ===========================================================================
# CALLBACKS
# ===========================================================================
@api_view(["GET", "POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def callback_list(request):
    if request.method == "POST":
        serializer = CallbackRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Callback request submitted successfully."},
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if not _is_admin(request) or not has_module_permission(request.user, "callbacks"):
        return Response({"detail": "Permission denied."},
                        status=status.HTTP_403_FORBIDDEN)

    callbacks = CallbackRequest.objects.all()
    serializer = CallbackRequestSerializer(callbacks, many=True)
    return Response(serializer.data)


@api_view(["DELETE", "PATCH"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
@require_module("callbacks")
def callback_detail(request, pk):
    try:
        callback = CallbackRequest.objects.get(pk=pk)
    except CallbackRequest.DoesNotExist:
        return Response({"error": "Callback request not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "PATCH":
        callback.is_read = request.data.get("is_read", callback.is_read)
        callback.save()
        return Response({"status": "updated"})

    callback.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ===========================================================================
# CHANGE PASSWORD
# ===========================================================================
# ===========================================================================
# CHANGE PASSWORD
# ===========================================================================
@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user

    # Removed the role check so ANY authenticated user (admin or subadmin) 
    # can change their own password.

    current_password = request.data.get("current_password", "")
    new_password = request.data.get("new_password", "")

    if not current_password or not new_password:
        return Response(
            {"detail": "Current password and new password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not user.check_password(current_password):
        return Response(
            {"detail": "Your current password is incorrect."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if current_password == new_password:
        return Response(
            {"detail": "New password must be different from current password."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(new_password)
    user.save()
    
    # CLEAR THE FORCE-CHANGE FLAG HERE
    if hasattr(user, "profile"):
        user.profile.must_change_password = False
        user.profile.save()

    # Delete old token and create a new one
    Token.objects.filter(user=user).delete()
    new_token = Token.objects.create(user=user)

    return Response(
        {"message": "Password changed successfully.", "token": new_token.key},
        status=status.HTTP_200_OK,
    )

@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
@require_admin
def create_sub_admin(request):
    s = CreateSubAdminSerializer(data=request.data)
    if not s.is_valid():
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)

    data = s.validated_data
    email = data["email"]
    
    # 👇 USE THE PASSWORD FROM THE FORM INSTEAD OF GENERATING ONE
    password = data["password"] 

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=data.get("first_name", ""),
        last_name=data.get("last_name", ""),
    )
    
    user.profile.role = "subadmin"
    user.profile.phone = data.get("phone", "")
    user.profile.created_by = request.user
    for module_key in data.get("permissions", []):
        flag = MODULE_PERMISSIONS.get(module_key)
        if flag:
            setattr(user.profile, flag, True)
    user.profile.save()

    return Response({
        "message": "Sub Admin created.",
        "user": ManagedUserSerializer(user).data,
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
@require_admin
def create_user(request):
    s = CreateUserSerializer(data=request.data)
    if not s.is_valid():
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)

    data = s.validated_data
    email = data["email"]
    password = _gen_password()

    user = User.objects.create_user(
        username=email,            # email IS the username
        email=email,
        password=password,
        first_name=data.get("first_name", ""),
        last_name=data.get("last_name", ""),
    )
    user.profile.role = "user"
    user.profile.phone = data.get("phone", "")
    user.profile.created_by = request.user
    user.profile.save()

    mail_error = None
    try:
        send_credentials_email(user.email, user.username, password, "User")
    except Exception as e:
        mail_error = str(e)

    payload = {
        "message": "User created." + (" Email failed." if mail_error else " Credentials emailed."),
        "user": ManagedUserSerializer(user).data,
    }
    if mail_error:
        payload["mail_error"] = mail_error
    return Response(payload, status=status.HTTP_201_CREATED)


@api_view(["PATCH"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
@require_admin
def update_subadmin_permissions(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    if user.profile.role != "subadmin":
        return Response({"detail": "This user is not a Sub Admin."},
                        status=status.HTTP_400_BAD_REQUEST)

    s = SubAdminPermissionsSerializer(data=request.data)
    if not s.is_valid():
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)

    selected = set(s.validated_data["permissions"])
    for module_key, flag in MODULE_PERMISSIONS.items():
        setattr(user.profile, flag, module_key in selected)
    user.profile.save()

    return Response({
        "message": "Permissions updated.",
        "user": ManagedUserSerializer(user).data,
        "permissions": list(selected),
    })


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
@require_admin
def list_managed_users(request):
    users = User.objects.select_related("profile").filter(
        profile__role__in=["subadmin", "user"]
    )
    return Response(ManagedUserSerializer(users, many=True).data)


@api_view(["PATCH"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
@require_admin
def toggle_user_active(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    if user.is_superuser:
        return Response({"detail": "Cannot modify the Admin account."},
                        status=status.HTTP_400_BAD_REQUEST)

    user.is_active = not user.is_active
    user.save()
    if not user.is_active:
        Token.objects.filter(user=user).delete()

    return Response({"message": "Updated.", "is_active": user.is_active})


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def whoami(request):
    if not (request.user and request.user.is_authenticated):
        return Response({"detail": "Authentication required."},
                        status=status.HTTP_401_UNAUTHORIZED)

    role, perms = _role_payload(request.user)
    name = f"{request.user.first_name} {request.user.last_name}".strip() or request.user.email

    return Response({
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,
        "name": name,
        "role": role,
        "permissions": perms,
        "must_change_password": getattr(request.user.profile, "must_change_password", False), # 👈 ADD THIS
    })






# ===========================================================================
# PAGE SEO MANAGEMENT
# ===========================================================================
@api_view(["GET", "POST"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
@require_module("pages")
def page_seo_list(request):
    if request.method == "GET":
        seo_settings = PageSEO.objects.all()
        serializer = PageSEOSerializer(seo_settings, many=True, context={"request": request})
        return Response(serializer.data)

    # POST: Create or update SEO for a page
    page_name = request.data.get("page_name")
    if not page_name:
        return Response({"error": "page_name is required"}, status=status.HTTP_400_BAD_REQUEST)
        
    seo_obj, created = PageSEO.objects.get_or_create(page_name=page_name)
    
    serializer = PageSEOSerializer(
        seo_obj, data=request.data, 
        partial=True, context={"request": request}
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser
from .models import SiteSettings
from .serializers import SiteSettingsSerializer

class SiteSettingsView(APIView):
    def get_permissions(self):
        # Allow anyone to GET the settings (for public website)
        if self.request.method == 'GET':
            return [AllowAny()]
        # Only admins can POST/PUT to update
        return [IsAdminUser()]

    def get(self, request):
        settings = SiteSettings.objects.first()
        if not settings:
            return Response({}, status=status.HTTP_200_OK)
        serializer = SiteSettingsSerializer(settings)
        return Response(serializer.data)

    def post(self, request):
        # This handles both ADD (if empty) and EDIT (if exists)
        settings = SiteSettings.objects.first()
        if settings:
            # Edit existing
            serializer = SiteSettingsSerializer(settings, data=request.data, partial=True)
        else:
            # Create new
            serializer = SiteSettingsSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)